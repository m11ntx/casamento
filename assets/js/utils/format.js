/*
  format — datas, durações e cálculo de diferença de tempo (usado pelo TimeCounter
  e pela Timeline). Sem dependências externas.
*/
(function (App) {
  'use strict';

  // diffParts(fromDate, toDate) — "fromDate" é o marco (ex.: data do
  // casamento) e "toDate" é normalmente "agora". isFuture indica se o MARCO
  // ainda vai acontecer (fromDate depois de toDate), não a direção bruta de
  // ms — por isso a comparação é ms < 0 (toDate ainda não alcançou fromDate),
  // e não ms > 0.
  function diffParts(fromDate, toDate) {
    var from = new Date(fromDate);
    var to = new Date(toDate);
    var ms = to - from;
    var totalSeconds = Math.floor(Math.abs(ms) / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var years = Math.floor(days / 365.25);
    var remDaysAfterYears = Math.floor(days - years * 365.25);
    var months = Math.floor(remDaysAfterYears / 30.44);
    var finalDays = Math.max(Math.floor(remDaysAfterYears - months * 30.44), 0);

    return {
      isFuture: ms < 0,
      totalDays: days,
      years: years,
      months: months,
      days: finalDays
    };
  }

  function formatDate(dateStr, options) {
    var date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR', options || { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function formatDuration(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '--:--';
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  App.utils = App.utils || {};
  App.utils.format = { diffParts: diffParts, formatDate: formatDate, formatDuration: formatDuration };
})(window.WeddingApp = window.WeddingApp || {});
