/*
  Bookmarklet loader del tester anti-bot.
  Se arrastra desde la landing a la barra de marcadores.
  Al clickearlo en cualquier pagina, inyecta tester.js.

  Version minificada (la que va en el href del <a> arrastrable):

  javascript:(function(){if(window.__abtTester){window.__abtTester.open();return;}var s=document.createElement('script');s.src='https://pat3csh0.github.io/luxora-compartido/anti-bots-tester/tester.js?'+Date.now();s.onerror=function(){alert('No se pudo cargar el tester anti-bot. Revisa la conexi\u00f3n.');};document.head.appendChild(s);})();

  Version legible (equivalente):
*/
(function () {
  if (window.__abtTester) {
    window.__abtTester.open();
    return;
  }
  var s = document.createElement('script');
  // Cache-bust para asegurar que siempre se carga la ultima version
  s.src = 'https://pat3csh0.github.io/luxora-compartido/anti-bots-tester/tester.js?' + Date.now();
  s.onerror = function () {
    alert('No se pudo cargar el tester anti-bot. Revisa la conexi\u00f3n.');
  };
  document.head.appendChild(s);
})();
