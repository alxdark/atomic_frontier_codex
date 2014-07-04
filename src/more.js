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
    
    insertionQ('.more').every(function(more) {
        if (more.__processed) { return; }
        more.style.display = 'none'; 
        var a = document.createElement("a");
        a.innerHTML = MORE;
        a.addEventListener("click", clickHandler(more));
        
        var previous = more.previousElementSibling;
        previous.appendChild(a);
        more.__processed = true;
    });
    
})();