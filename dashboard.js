document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const table = $("reportsTable"), empty = $("emptyMessage");
  const search = $("searchInput"), typeFilter = $("typeFilter"), statusFilter = $("statusFilter");
  const {getReports,saveReports} = window.DIGITALCITY;

  function cell(value) { const td = document.createElement("td"); td.textContent = value ?? ""; return td; }

  function updateStats(reports) {
    const pending = reports.filter(r => r.status === "pending").length;
    const processing = reports.filter(r => r.status === "processing").length;
    const solved = reports.filter(r => r.status === "solved").length;
    $("dashTotal").textContent = reports.length; $("dashPending").textContent = pending;
    $("dashProcessing").textContent = processing; $("dashSolved").textContent = solved;
    $("completionRate").textContent = reports.length ? Math.round(solved / reports.length * 100) + "%" : "0%";
    const chart = $("statusChart"); chart.replaceChildren();
    [["جديد",pending,"pending"],["قيد المعالجة",processing,"processing"],["تم الحل",solved,"solved"]].forEach(([label,count,cls]) => {
      const wrap = document.createElement("div"); wrap.className = "chart-row";
      const head = document.createElement("div"); head.className = "chart-label";
      const name = document.createElement("span"); name.textContent = label;
      const num = document.createElement("b"); num.textContent = count; head.append(name,num);
      const track = document.createElement("div"); track.className = "chart-track";
      const bar = document.createElement("div"); bar.className = "chart-bar " + cls;
      bar.style.width = (count / Math.max(reports.length,1) * 100) + "%";
      track.appendChild(bar); wrap.append(head,track); chart.appendChild(wrap);
    });
  }

  function render() {
    const all = getReports(); updateStats(all);
    const term = search.value.trim().toLocaleLowerCase("ar");
    const shown = all.filter(r => [r.id,r.type,r.area,r.description].join(" ").toLocaleLowerCase("ar").includes(term)
      && (!typeFilter.value || r.type === typeFilter.value)
      && (!statusFilter.value || r.status === statusFilter.value));
    table.replaceChildren(); $("reportCount").textContent = `عرض ${shown.length} من ${all.length} بلاغ`;
    empty.style.display = shown.length ? "none" : "block";
    empty.querySelector("h3").textContent = all.length ? "لا توجد نتائج مطابقة" : "لا توجد بلاغات حتى الآن";
    empty.querySelector("p").textContent = all.length ? "جرّب تغيير كلمات البحث أو الفلاتر." : "عند تقديم بلاغ جديد سيظهر هنا.";
    shown.forEach(r => {
      const tr = document.createElement("tr");
      tr.append(cell(String(r.id).slice(0,8)),cell(r.type),cell(r.area),cell(r.date));
      const photo = document.createElement("td");
      if (typeof r.image === "string" && r.image.startsWith("data:image/")) {
        const img = document.createElement("img"); img.src = r.image; img.alt = "صورة البلاغ"; img.className = "table-thumb"; photo.appendChild(img);
      } else photo.textContent = "—";
      tr.appendChild(photo);
      const statusTd = document.createElement("td"), select = document.createElement("select");
      select.className = "status-select"; select.setAttribute("aria-label","تغيير حالة البلاغ");
      [["pending","جديد"],["processing","قيد المعالجة"],["solved","تم الحل"]].forEach(([v,l]) => {
        const opt = document.createElement("option"); opt.value = v; opt.textContent = l; select.appendChild(opt);
      });
      select.value = ["pending","processing","solved"].includes(r.status) ? r.status : "pending";
      select.addEventListener("change", () => { saveReports(getReports().map(x => x.id === r.id ? {...x,status:select.value} : x)); render(); });
      statusTd.appendChild(select); tr.appendChild(statusTd);
      const detailTd = document.createElement("td"), link = document.createElement("a");
      link.className = "table-link"; link.href = "details.html?id=" + encodeURIComponent(r.id); link.textContent = "عرض التفاصيل";
      detailTd.appendChild(link); tr.appendChild(detailTd);
      const actionTd = document.createElement("td"), del = document.createElement("button");
      del.className = "delete-btn"; del.textContent = "حذف";
      del.addEventListener("click", () => { if (confirm("هل تريد حذف هذا البلاغ؟")) { saveReports(getReports().filter(x => x.id !== r.id)); render(); } });
      actionTd.appendChild(del); tr.appendChild(actionTd); table.appendChild(tr);
    });
  }
  search.addEventListener("input",render); typeFilter.addEventListener("change",render); statusFilter.addEventListener("change",render);
  $("resetFilters").addEventListener("click",() => {search.value="";typeFilter.value="";statusFilter.value="";render();});
  $("refreshBtn").addEventListener("click",render); window.addEventListener("storage",render); render();
});