let carrinho = [];


// ==========================
// KITS VIP - SAIBA MAIS
// ==========================

const kits = {

    ferro: {

        titulo: "🛡 VIP Ferro",

        imagem: "assets/kit-guerreiro.png",

        texto: `
        <b>Kit Ferro exclusivo</b><br><br>

        🛡 Full Ferro - Proteção IV<br>
        🛡 Escudo - Inquebrável III<br>
        ⚔ Ferramentas - Eficiência IV e Afiação IV<br><br>

        🎁 Recompensas:<br>
        4x Totem da Imortalidade<br>
        32x Pérola do End<br>
        64x Filé<br>
        16x Maçã Dourada
        `

    },


    diamante: {

        titulo: "💎 VIP Diamante",

        imagem: "assets/kit-supremo.png",

        texto: `
        <b>Kit Diamante exclusivo</b><br><br>

        💎 Full Diamante - Proteção III<br>
        🛡 Escudo - Inquebrável III<br>
        ⚔ Ferramentas - Eficiência III e Afiação III<br><br>

        🎁 Recompensas:<br>
        12x Maçã Dourada<br>
        32x Pérola do End<br>
        16x Diamantes<br>
        3x Maçã Dourada Encantada<br>
        1x Melhoria de Netherita<br>
        64x Filé
        `

    },


    netherite: {

        titulo: "⚔ VIP Netherite",

        imagem: "assets/kit-rei.png",

        texto: `
        <b>Kit Netherite exclusivo</b><br><br>

        ⚫ Full Netherite - Proteção IV<br>
        🛡 Escudo - Inquebrável III<br>
        ⚔ Ferramentas - Eficiência IV e Afiação IV<br><br>

        🔥 Mace<br>
        ⚔ Lança de Netherite Encantada<br>
        7x Cristal do End<br>
        5x Maçã Dourada Encantada<br>
        20x Maçã Dourada<br>
        64x Pérola do End<br>
        5 Packs de Foguete<br>
        16x Obsidian<br>
        5x Totem da Imortalidade<br>
        1x Élitro
        `

    },


    rei: {

        titulo: "👑 VIP Rei",

        imagem: "assets/kit-deus.png",

        texto: `
        <b>Kit Rei exclusivo</b><br><br>

        👑 Full Netherite - Full Enchant<br>
        🛡 Escudo - Full Enchant<br>
        ⚔ Ferramentas - Eficiência V e Afiação V<br><br>

        🎁 Recompensas:<br>
        32x Maçã Dourada<br>
        10x Maçã Dourada Encantada<br>
        32x Pérola do End<br>
        5 Packs de Foguete<br>
        32x Obsidian<br>
        10x Totem da Imortalidade<br>
        1x Élitro Full Enchant<br>
        Mace Full Enchant<br>
        Lança Full Enchant<br>
        16x Cristal do End
        `

    }

};



// ==========================
// POPUP SAIBA MAIS
// ==========================


function abrirInfo(vip){

    document.getElementById("popup").style.display = "flex";


    document.getElementById("tituloVip").innerHTML =
    kits[vip].titulo;


    document.getElementById("textoVip").innerHTML =
    kits[vip].texto;


    document.getElementById("imagemKit").src =
    kits[vip].imagem;

}



function fecharInfo(){

    document.getElementById("popup").style.display = "none";

}



// ==========================
// CARRINHO (SERVIÇOS)
// ==========================


function adicionarCarrinho(nome, preco, tipo){


    let produto =
    carrinho.find(item => item.nome === nome);



    if(produto){

        produto.quantidade++;

    }

    else {


        carrinho.push({

            nome:nome,

            preco:preco,

            tipo:tipo,

            quantidade:1

        });

    }


    atualizarCarrinho();

}
// ==========================
// ALTERAR QUANTIDADE
// ==========================


function alterarQuantidade(nome, valor){


    let produto =
    carrinho.find(item => item.nome === nome);



    if(!produto) return;



    produto.quantidade += valor;



    if(produto.quantidade <= 0){

        removerCarrinho(nome);

        return;

    }



    atualizarCarrinho();

}






// ==========================
// REMOVER ITEM
// ==========================


function removerCarrinho(nome){


    carrinho =
    carrinho.filter(item => item.nome !== nome);


    atualizarCarrinho();

}







// ==========================
// ATUALIZAR CARRINHO
// ==========================


function atualizarCarrinho(){


    let lista =
    document.getElementById("cart-items");


    let contador =
    document.getElementById("cart-count");


    let total =
    document.getElementById("cart-total");



    if(!lista) return;



    lista.innerHTML = "";



    let valorTotal = 0;

    let quantidade = 0;



    if(carrinho.length === 0){


        lista.innerHTML = `

        <p>
        🗝️ Seu baú está vazio...
        </p>

        `;

    }



    carrinho.forEach(item => {



        valorTotal += item.preco * item.quantidade;


        quantidade += item.quantidade;



        let imagem = "";



        if(item.nome.includes("Home")){

            imagem = "assets/home.png";

        }


        else if(item.nome.includes("desban")){

            imagem = "assets/desban.png";

        }




        lista.innerHTML += `


        <div class="cart-item">


            <img 
            src="${imagem}"
            class="cart-product-img"
            >


            <b>
            ${item.nome}
            </b>


            <br><br>


            Quantidade:
            ${item.quantidade}



            <br><br>


            <button onclick="alterarQuantidade('${item.nome}',-1)">
            ➖
            </button>


            <button onclick="alterarQuantidade('${item.nome}',1)">
            ➕
            </button>


            <br><br>


            💰 R$
            ${(item.preco * item.quantidade)
            .toFixed(2)
            .replace(".",",")}



            <br><br>


            <button onclick="removerCarrinho('${item.nome}')">

            🗑 Remover

            </button>



        </div>


        `;


    });



    if(contador){

        contador.innerHTML = quantidade;

    }



    if(total){

        total.innerHTML =
        "Total: R$ " +
        valorTotal
        .toFixed(2)
        .replace(".",",");

    }


}







// ==========================
// ABRIR / FECHAR CARRINHO
// ==========================


function playChestSound(){
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(70, ctx.currentTime + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.2);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.1);
        osc2.stop(ctx.currentTime + 0.25);
    } catch(e) {}
}

function abrirCarrinho(){
    playChestSound();

    document.getElementById("cart-button")
    .classList.add("open");

    document.getElementById("cart-panel")
    .classList.add("cart-open");

    document.getElementById("cart-overlay")
    .classList.add("cart-open");
}



function fecharCarrinho(){

    document.getElementById("cart-button")
    .classList.remove("open");

    document.getElementById("cart-panel")
    .classList.remove("cart-open");

    document.getElementById("cart-overlay")
    .classList.remove("cart-open");
}







// ==========================
// FINALIZAR COMPRA
// ==========================


function finalizarCompra(){


    if(carrinho.length === 0){


        alert("Seu baú está vazio!");

        return;

    }


    alert("Os serviços serão processados pela equipe Reis Craft.");

}








// ==========================
// NAVBAR MOBILE
// ==========================

function toggleNav(){
    document.querySelector('.navbar').classList.toggle('nav-open');
    document.body.classList.toggle('nav-open');
}

function fecharNav(){
    document.querySelector('.navbar').classList.remove('nav-open');
    document.body.classList.remove('nav-open');
}

function copiarTexto(texto, nomeServidor){


    navigator.clipboard.writeText(texto);


    alert("Copiado: " + texto);


    if(nomeServidor){
        var link = document.createElement('a');
        link.href = "minecraft://?addExternalServer=" + encodeURIComponent(nomeServidor) + "|" + texto;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


}

// ==========================
// HERO EFFECTS — PARTICULAS & PARALLAX
// ==========================

(function(){

    var heroSection = document.getElementById('inicio');
    if(!heroSection) return;

    var canvas = document.getElementById('hero-particles');
    if(!canvas) return;

    var ctx = canvas.getContext('2d');
    var lightingEl = heroSection.querySelector('.hero-lighting');

    var w = 0;
    var h = 0;
    var targetMX = 0;
    var targetMY = 0;
    var currentMX = 0;
    var currentMY = 0;
    var particles = [];
    var rafId = null;
    var running = false;
    var PARTICLE_COUNT = 55;

    var COLORS = [

        'rgba(170,0,255,',

        'rgba(200,100,255,',

        'rgba(255,180,50,',

        'rgba(255,215,0,',

        'rgba(180,120,255,',

        'rgba(255,255,255,'

    ];



    function resize(){

        var rect = heroSection.getBoundingClientRect();

        w = canvas.width = rect.width;

        h = canvas.height = rect.height;

    }



    function createParticle(){

        var isWarm = Math.random() > .45;

        var baseColor = isWarm ? COLORS[2] : COLORS[0];

        var isBright = Math.random() > .7;

        var maxR = isBright ? 3.5 : 1.6;

        var maxAlpha = isBright ? .55 : .3;

        var baseAlpha = Math.random() * (maxAlpha - .1) + .1;

        return {

            x: Math.random() * w,

            y: Math.random() * h,

            vx: (Math.random() - .5) * .12,

            vy: (Math.random() - .5) * .12,

            r: Math.random() * maxR + .4,

            alpha: baseAlpha,

            color: baseColor,

            phase: Math.random() * Math.PI * 2,

            speed: .002 + Math.random() * .003,

            bright: isBright

        };

    }



    function initParticles(){

        particles = [];

        for(var i = 0; i < PARTICLE_COUNT; i++){

            particles.push(createParticle());

        }

    }



    function drawParticles(t){

        ctx.clearRect(0, 0, w, h);

        for(var i = 0; i < particles.length; i++){

            var p = particles[i];

            var flicker = .7 + .3 * Math.sin(t * p.speed + p.phase);

            var a = p.alpha * flicker;

            ctx.beginPath();

            ctx.arc(p.x, p.y, Math.max(.1, p.r), 0, Math.PI * 2);

            ctx.fillStyle = p.color + a + ')';

            ctx.fill();

            p.x += p.vx;

            p.y += p.vy;

            if(p.x < -20) p.x = w + 20;

            if(p.x > w + 20) p.x = -20;

            if(p.y < -20) p.y = h + 20;

            if(p.y > h + 20) p.y = -20;

        }

    }



    function updateParallax(){

        currentMX += (targetMX - currentMX) * .06;

        currentMY += (targetMY - currentMY) * .06;

        if(lightingEl){

            lightingEl.style.transform = 'translate(' + (currentMX * 6) + 'px,' + (currentMY * 6) + 'px)';

        }

    }



    function animate(t){

        if(!running) return;

        drawParticles(t);

        updateParallax();

        rafId = requestAnimationFrame(animate);

    }



    function start(){

        if(running) return;

        running = true;

        resize();

        initParticles();

        rafId = requestAnimationFrame(animate);

    }



    function stop(){

        running = false;

        if(rafId) cancelAnimationFrame(rafId);

        rafId = null;

    }



    document.addEventListener('mousemove', function(e){

        var cx = window.innerWidth / 2;

        var cy = window.innerHeight / 2;

        targetMX = (e.clientX - cx) / cx;

        targetMY = (e.clientY - cy) / cy;

    });



    var observer = new IntersectionObserver(function(entries){

        entries.forEach(function(entry){

            if(entry.isIntersecting){

                start();

            } else {

                stop();

            }

        });

    }, { threshold: 0 });



    observer.observe(heroSection);



    window.addEventListener('resize', function(){

        resize();

        initParticles();

    });

})();
