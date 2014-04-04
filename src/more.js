(function() {
    
    var MORE = " More&hellip;";
    var LESS = " Less&hellip;";
    
    function clickHandler(more) {
        return function(e) {
            var alt = (more.style.display === "none") ? "block" : "none";
            more.style.display = alt;
            e.target.innerHTML = (alt === "block") ? LESS : MORE;
        };       
    }
    
    window.updateMoreLinks = function() {
        var mores = document.querySelectorAll(".more");
        for (var i=0; i < mores.length; i++) {
            var more = mores[i];
            more.style.display = 'none'; 
            if (more.__processed) { continue; }

            var a = document.createElement("a");
            a.innerHTML = MORE;
            a.addEventListener("click", clickHandler(more));
            
            var previous = more.previousElementSibling;
            previous.appendChild(a);
        }
    };
    
})();