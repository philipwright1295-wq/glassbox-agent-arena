import fs from "node:fs";
import crypto from "node:crypto";
import config from "../config.json" with { type: "json" };

function field(body, heading) {
  const escaped = heading.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
  const re = new RegExp(`###\\s+${escaped}\\s*\\n+([\\s\\S]*?)(?=\\n###\\s+|$)`, "i");
  return body.match(re)?.[1]?.trim() ?? "";
}
const digest = value => crypto.createHash("sha256").update(value).digest("hex");

const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,"utf8"));
const issue = event.issue;
let result = { handled:false, valid:false, code:"IGNORED" };

if (issue?.title?.startsWith("[GB-001 ATTEMPT]")) {
  const body = issue.body ?? "";
  const mode = field(body,"Enter").toLowerCase();
  const mark = field(body,"Mark");
  const claim = field(body,"Claim");

  result = { handled:true, valid:false, code:"NOT_LANDED", mode };

  if (mode !== "dry-run") {
    result.code = "PAID_LOCKED";
  } else if (mark.length < 8) {
    result.code = "BAD_MARK";
  } else {
    try {
      const ids = JSON.parse(claim);
      if (Array.isArray(ids) && ids.every(x => typeof x === "string") && new Set(ids).size === ids.length && ids.length <= 6) {
        const canonical = [...ids].sort().join(",");
        const commitment = digest(`GB-001|2|${canonical}`);
        if (commitment === config.winningCommitment) {
          const landingMark = digest(`GB-001|${issue.number}|${issue.user.login}|${issue.created_at}|${mark}|LAND`).slice(0,12);
          const deadline = new Date(new Date(issue.created_at).getTime() + config.landingWindowMinutes * 60000).toISOString();
          result = { handled:true, valid:true, code:"CLAIMABLE", mode, landingMark, deadline, login:issue.user.login };
        }
      }
    } catch {}
  }
}

fs.writeFileSync("/tmp/glassbox-attempt.json", JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
