const PRODUTOS = {
  vips: {
    titulo: "Escolha seu VIP",
    exclusivo: true,
    cor: "#ffd700",
    itens: [
      {
        id: "vip_ferro",
        nome: "VIP Ferro",
        preco: 16.02,
        moeda: "USD",
        tebexId: 7588021,
        cor: "#c0c0c0",
        icone: "🛡",
        imagem: "assets/vip-guerreiro.webp",
        imagemKit: "assets/kit-ferro.webp",
        descricao: "Kit Ferro exclusivo",
        beneficios: [
          "Full Ferro - Proteção IV",
          "Escudo - Inquebrável III",
          "Ferramentas Eficiência IV e Afiação IV",
          "4x Totem da Imortalidade",
          "32x Pérola do End",
          "64x Filé",
          "16x Maçã Dourada"
        ]
      },
      {
        id: "vip_diamante",
        nome: "VIP Diamante",
        preco: 19.04,
        moeda: "USD",
        tebexId: 7588026,
        cor: "#00d4ff",
        icone: "💎",
        imagem: "assets/vip-supremo.webp",
        imagemKit: "assets/kit-diamante.webp",
        descricao: "Kit Diamante exclusivo",
        beneficios: [
          "Full Diamante - Proteção III",
          "Escudo - Inquebrável III",
          "Ferramentas Eficiência III e Afiação III",
          "12x Maçã Dourada",
          "32x Pérola do End",
          "16x Diamantes",
          "3x Maçã Dourada Encantada",
          "1x Melhoria de Netherita",
          "64x Filé"
        ]
      },
      {
        id: "vip_netherite",
        nome: "VIP Netherite",
        preco: 25.03,
        moeda: "USD",
        tebexId: 7588030,
        cor: "#b060ff",
        icone: "⚔",
        imagem: "assets/vip-rei.webp",
        imagemKit: "assets/kit-netherite.webp",
        descricao: "Kit Netherite exclusivo",
        beneficios: [
          "Full Netherite - Proteção IV",
          "Escudo - Inquebrável III",
          "Ferramentas Eficiência IV e Afiação IV",
          "Mace",
          "Lança de Netherite Encantada",
          "7x Cristal do End",
          "5x Maçã Dourada Encantada",
          "20x Maçã Dourada",
          "64x Pérola do End",
          "5 Packs de Foguete",
          "16x Obsidian",
          "5x Totem da Imortalidade",
          "1x Élitro"
        ]
      },
      {
        id: "vip_rei",
        nome: "VIP Rei",
        preco: 50.07,
        moeda: "USD",
        tebexId: 7588032,
        cor: "#ffd700",
        icone: "👑",
        imagem: "assets/vip-deus.webp",
        imagemKit: "assets/kit-rei.webp",
        descricao: "Kit Rei exclusivo",
        beneficios: [
          "Full Netherite - Full Enchant",
          "Escudo - Full Enchant",
          "Ferramentas Eficiência V e Afiação V",
          "32x Maçã Dourada",
          "10x Maçã Dourada Encantada",
          "32x Pérola do End",
          "5 Packs de Foguete",
          "32x Obsidian",
          "10x Totem da Imortalidade",
          "1x Élitro Full Enchant",
          "Mace Full Enchant",
          "Lança Full Enchant",
          "16x Cristal do End"
        ]
      }
    ]
  },
  extras: {
    titulo: "Extras",
    exclusivo: false,
    cor: "#ff8c00",
    itens: [
      {
        id: "home",
        nome: "Home Adicional",
        preco: 7.03,
        moeda: "USD",
        tebexId: 7588036,
        maxQtd: null,
        cor: "#ff8c00",
        icone: "🏠",
        imagem: "assets/home.webp",
        descricao: "Adicione um novo ponto de teleporte.",
        ativacaoManual: true,
        manual: {
          titulo: "🏠 Home Adicional",
          texto: "Adicione um ponto de teleporte &quot;Home&quot; permanente ao seu reino.<br>Ao comprar, seu limite de homes aumenta em <b>+1</b> (definitivo, não expira).<br><br><b>Como usar:</b><br>• No local que quiser salvar, digite: <code>/sethome base</code><br>• Para voltar até ele de qualquer lugar, digite: <code>/home base</code><br>• Quer outra? <code>/sethome base2</code> + <code>/home base2</code>, <code>/sethome base3</code> + <code>/home base3</code>...<br><br>📦 <b>Ativação Manual:</b> após concluir o pagamento, fale com o suporte no Discord informando o número do pedido para ativarmos o mais rápido possível."
        }
      },
      {
        id: "desban",
        nome: "Seja Desbanido",
        preco: 50.05,
        moeda: "USD",
        tebexId: 7588047,
        maxQtd: 1,
        cor: "#ff4444",
        icone: "🔓",
        imagem: "assets/desban.webp",
        descricao: "Recupere seu acesso ao reino.",
        ativacaoManual: true,
        manual: {
          titulo: "🔓 Seja Desbanido",
          texto: "Recupere o acesso ao seu reino após um banimento.<br>O desbanimento é aplicado manualmente pela equipe.<br><br>📦 <b>Ativação Manual:</b> após concluir o pagamento, fale com o suporte no Discord informando o número do pedido para liberarmos seu acesso o mais rápido possível."
        }
      },
      {
        id: "kingspass",
        nome: "King's Pass",
        preco: 29.90,
        moeda: "USD",
        tebexId: null,
        maxQtd: 1,
        cor: "#ffd700",
        icone: "🎫",
        imagem: "assets/kingspass.webp",
        imagemKit: "assets/kingspass.webp",
        descricao: "Desbloqueie a versão premium do Passe de Batalha do ReisCraft e evolua sua jornada como nunca antes!",
        infoLonga: "Desbloqueie a versão premium do Passe de Batalha do ReisCraft e evolua sua jornada como nunca antes!<br><br>O King's Pass oferece uma trilha exclusiva de recompensas para quem deseja acelerar sua progressão e conquistar itens únicos durante a temporada. Ao completar missões e desafios, você desbloqueará prêmios cada vez melhores, incluindo recompensas exclusivas disponíveis apenas para jogadores premium.<br><br><b>O que você recebe:</b><br>👑 Acesso à trilha premium do Passe de Batalha.<br>🎁 Recompensas exclusivas em cada nível.<br>⚔️ Itens, recursos e cosméticos especiais.<br>🚀 Progressão muito mais recompensadora durante toda a temporada.<br>⭐ Benefícios únicos que não estão disponíveis no passe gratuito.<br><br><b>Importante:</b> O King's Pass libera apenas a trilha premium da temporada atual. Para resgatar as recompensas, basta evoluir normalmente completando os desafios e acumulando progresso no Passe de Batalha.<br><br>Mostre que você faz parte da elite do ReisCraft e aproveite uma experiência muito mais completa com o King's Pass!"
      }
    ]
  }
};

function getProduto(id) {
  for (const cat of Object.values(PRODUTOS)) {
    for (const item of cat.itens) {
      if (item.id === id) return item;
    }
  }
  return null;
}

function formatarPreco(valor) {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}
