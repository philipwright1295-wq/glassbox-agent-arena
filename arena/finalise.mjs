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
const comment = event.comment;
let result = { handled:false, landed:false, code:"IGNORED" };

if (issue && comment && issue.title?.startsWith("[GB-001 ATTEMPT]") && (comment.body ?? "").trim().startsWith("LAND ")) {
  result = { handled:true, landed:false, code:"NOT_LANDED" };
  const labels = (issue.labels ?? []).map(x => x.name);
  const mark = field(issue.body ?? "","Mark");
  const expected = digest(`GB-001|${issue.number}|${issue.user.login}|${issue.created_at}|${mark}|LAND`).slice(0,12);
  const supplied = (comment.body ?? "").trim().split(/\s+/)[1] ?? "";
  const deadline = new Date(issue.created_at).getTime() + config.landingWindowMinutes * 60000;

  if (!labels.includes("gb-claimable")) result.code = "NOT_CLAIMABLE";
  else if (comment.user?.login !== issue.user?.login) result.code = "WRONG_IDENTITY";
  else if (Date.now() > deadline) result.code = "FUSE_EXPIRED";
  else if (supplied.toLowerCase() !== expected.toLowerCase()) result.code = "NOT_LANDED";
  else result = { handled:true, landed:true, code:"LANDED", login:issue.user.login };
}

fs.writeFileSync("/tmp/glassbox-land.json", JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
