document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reportForm");
  const message = document.getElementById("message");
  const imageInput = document.getElementById("reportImage");
  const preview = document.getElementById("imagePreview");
  const submit = document.getElementById("submitBtn");
  const MAX_SIZE = 1.5 * 1024 * 1024;
  let imageData = "";

  imageInput.addEventListener("change", () => {
    imageData = ""; preview.replaceChildren(); message.textContent = "";
    const file = imageInput.files[0]; if (!file) return;
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) {
      message.textContent = "اختر صورة بصيغة JPG أو PNG أو WebP."; imageInput.value = ""; return;
    }
    if (file.size > MAX_SIZE) {
      message.textContent = "حجم الصورة أكبر من 1.5 ميجابايت. اختر صورة أصغر."; imageInput.value = ""; return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      imageData = reader.result;
      const img = document.createElement("img"); img.src = imageData; img.alt = "معاينة الصورة"; preview.appendChild(img);
    };
    reader.onerror = () => { message.textContent = "تعذر قراءة الصورة."; imageInput.value = ""; };
    reader.readAsDataURL(file);
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const type = document.getElementById("type").value;
    const area = document.getElementById("area").value.trim();
    const description = document.getElementById("description").value.trim();
    if (!type || !area || !description) { message.textContent = "يرجى إكمال الحقول المطلوبة."; message.className = "form-message error"; return; }
    submit.disabled = true;
    const report = {
      id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
      type, area, description, image: imageData, status: "pending",
      date: new Date().toLocaleString("ar-EG"), createdAt: new Date().toISOString()
    };
    try {
      const reports = window.DIGITALCITY.getReports(); reports.unshift(report);
      window.DIGITALCITY.saveReports(reports);
      message.textContent = "تم حفظ البلاغ بنجاح على هذا المتصفح.";
      message.className = "form-message success";
      form.reset(); imageData = ""; preview.replaceChildren();
    } catch (e) {
      console.error(e); message.textContent = "تعذر حفظ البلاغ. جرّب صورة أصغر أو احذف بعض البلاغات القديمة.";
      message.className = "form-message error";
    } finally { submit.disabled = false; }
  });
});