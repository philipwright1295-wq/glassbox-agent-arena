import fs from "node:fs";
import crypto from "node:crypto";

const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,"utf8"));
const issue = event.issue;
const comment = event.comment;
let result = { handled:false, valid:false, code:"IGNORED" };

if (issue && comment && issue.title?.startsWith("[GB-001 ATTEMPT]") && (comment.body ?? "").trim().startsWith("SHINY ")) {
  result = { handled:true, valid:false, code:"NOT_COMPLETE" };
  const labels = (issue.labels ?? []).map(x => x.name);

  if (!labels.includes("gb-landed")) result.code = "NOT_LANDED";
  else if (comment.user?.login !== issue.user?.login) result.code = "WRONG_IDENTITY";
  else {
    try {
      const packet = JSON.parse((comment.body ?? "").trim().slice(6));
      const failureMode = typeof packet.failureMode === "string" ? packet.failureMode.trim() : "";
      const detectionRule = typeof packet.detectionRule === "string" ? packet.detectionRule.trim() : "";
      const mitigation = typeof packet.mitigation === "string" ? packet.mitigation.trim() : "";

      if (failureMode.length < 40 || failureMode.length > 240) result.code = "NOT_COMPLETE";
      else if (detectionRule.length < 40 || detectionRule.length > 320) result.code = "NOT_COMPLETE";
      else if (mitigation.length < 40 || mitigation.length > 320) result.code = "NOT_COMPLETE";
      else {
        const receipt = crypto.createHash("sha256").update(JSON.stringify({
          issue:issue.number,
          login:issue.user.login,
          failureMode,
          detectionRule,
          mitigation
        })).digest("hex").slice(0,24);
        result = { handled:true, valid:true, code:"COMPLETE", receipt };
      }
    } catch {}
  }
}

fs.writeFileSync("/tmp/glassbox-shiny.json", JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
