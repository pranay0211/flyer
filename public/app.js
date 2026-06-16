const $ = (id) => document.getElementById(id);

let lastImage = null;

function setStatus(message, type = "info") {
  const el = $("status");
  el.textContent = message || "";
  el.className = `status ${type}`;
}

function requireFile(id, label) {
  const file = $(id)?.files?.[0];
  if (!file) throw new Error(`Please upload ${label}.`);
  return file;
}

function filenameDate() {
  return ($("date").value || "WENY-Flyer")
    .replaceAll(" ", "-")
    .replaceAll("/", "-")
    .replaceAll(",", "");
}

function setButtonLoading(isLoading) {
  const btn = $("aiBtn");
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Creating Premium Flyer..." : "Generate Premium Flyer";
}

$("aiBtn").onclick = async () => {
  setButtonLoading(true);
  setStatus("Uploading photos and creating your premium flyer. This may take 20–60 seconds...", "info");

  try {
    const fd = new FormData();

    fd.append("theme", $("theme").value);
    fd.append("date", $("date").value);
    fd.append("day", $("day").value);
    fd.append("joining", $("joining").value);
    fd.append("happy", $("happy").value);
    fd.append("emceeName", $("emceeName").value);
    fd.append("workoutName", $("workoutName").value);
    fd.append("workoutType", $("workoutType").value);
    fd.append("knowledgeName", $("knowledgeName").value);
    fd.append("topic", $("topic").value);

    const reference = $("referencePhoto")?.files?.[0];
    if (reference) fd.append("reference", reference);

    fd.append("emceePhoto", requireFile("emceePhoto", "EMCEE photo"));
    fd.append("workoutPhoto", requireFile("workoutPhoto", "Workout Trainer photo"));
    fd.append("knowledgePhoto", requireFile("knowledgePhoto", "Knowledge Session photo"));

    const response = await fetch("/api/generate-flyer", {
      method: "POST",
      body: fd
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Flyer generation failed.");

    lastImage = json.image;
    const output = $("generatedOutput");
    output.innerHTML = "";

    const img = new Image();
    img.src = json.image;
    img.className = "resultFlyer";
    img.alt = "Generated WENY Flyer";
    output.appendChild(img);

    $("downloadGeneratedBtn").style.display = "block";
    setStatus("Done! Your premium flyer is ready.", "success");
  } catch (err) {
    console.error(err);
    setStatus(err.message, "error");
    alert(err.message);
  } finally {
    setButtonLoading(false);
  }
};

$("downloadGeneratedBtn").onclick = () => {
  if (!lastImage) return;
  const a = document.createElement("a");
  a.href = lastImage;
  a.download = `WENY-Flyer-${filenameDate()}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

$("clearBtn").onclick = () => {
  lastImage = null;
  $("downloadGeneratedBtn").style.display = "none";
  $("generatedOutput").innerHTML = `
    <div class="emptyState">
      <div class="emptyIcon">✨</div>
      <h3>Ready to create premium WENY flyer</h3>
      <p>Add photos and click Generate Premium Flyer.</p>
    </div>
  `;
  setStatus("");
};
