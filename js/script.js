document.addEventListener('DOMContentLoaded', () => { //isso fas com que o site não precise esperar todas as imagens para rodar
   const mario = document.querySelector('.mario'); //quando eu faço um query ele pode puxar uma classe
   const pipe = document.querySelector('.pipe');
   const gameBoard = document.getElementById('game-board');
   const hudPlayerName = document.getElementById('hud-player-name');
   const scoreDisplay = document.getElementById('score-display');
   const jumpTip = document.getElementById('jump-tip');
   const startModal = document.getElementById('start-modal');
   const startForm = document.getElementById('start-form');
   const playerInput = document.getElementById('player-input');
});
   //Modais e Telas
   const startModal = document.getElementById('start-modal');
   const startForm = document.getElementById('start-form');
   const playerInput = document.getElementById('player-input');
   const btnViewRanking = document.getElementById('btn-view-ranking');
   
   const gameoverModal = document.getElementById('gameover-modal');
   const finalScoreValue = document.getElementById('final-score-value');
   const saveStatusMsg = document.getElementById('ranking-body');
   const btnRestart = document.getElementById('btn-restart');
   const btnChangePlayer = document.getElementById('btn-change-player');
   //Variáveis de Estado
   let currentPlayer = '';
   let score = 0;
   let isPlaying = false;
   let gameLoop = null;
   let scoreLoop = null;
   //Recuperação do último nome usado
   const savedName = localStorage.getItem('mario_jump_player');
   if (savedName && playerInput) {
      playerInput.value = savedName;
   }

   function startGame(){
      //limpei loops anteriores se existirem
      clearInterval(gameLoop);
      clearInterval(scoreLoop);

      resetElements();

      isPlaying = true;
      score = 0;
      scoreDisplay.textContent = '0';
      hudPlayerName.textContent = currentPlayer || 'Jogador';
      //ativa as animações CSS do jogo.
      gameBoard.classList.add('running');
      //Loop de pontuação progressiva (1 ponto a cada 100ms)
      scoreLoop = setInterval(() => {
         if(isPlaying){
            score += 1;
            scoreDisplay.textContent = score;
         }
      }, 100)
      //Loop de colisão
      gameLoop = setInterval(checkCollision, 10);
   }
   //Resetar posições e estilos do Mario e do Cano
   function resetElements(){
      //reseta o cano
      pipe.style.animation = '';
      pipe.style.left = '';

      //reset do Mario
      mario.src = '../assets/mario.gif'//".." para sair de uma pasta "que no caso é a js" e o "/nome da pasta" é para entrar em outra pasta
      mario.style.animation = '';
      mario.style.bottom = '0px';
      mario.style.width = '';
      mario.style.marginLeft = '';
      mario.classList.remove('jump');
      if (jumpTip){
         jumpTip.style.opacity = '1';
      }
   }
   //Executa o pulo do Mario
   function jump(){
      if (!isPlaying) return;
      if (mario.classList.contains('jump')) return;

      mario.classList.add('jump');

      if(jumpTip){
         jumpTip.style.opacity = '0';
      }

      setTimeout(() => {
         mario.classList.remove('jump');
      }, 500);
   }
   //verifica a colisão entre o mario e o cano
   function checkCollision(){
      if (!isPlaying) return;

      const pipePosition = pipe.offsetLeft;
      const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
      //Tolerância de colisão: quando uma hitbox acerta a outra
      if(pipePosition <= 120 && pipePosition > 0 && marioPosition < 80){
         triggerGameOver(pipePosition, marioPosition);
      }
   }
   //tratar o GameOver
   function triggerGameOver(pipePosition, marioPosition){
      isPlaying = false;
      clearInterval(gameLoop);
      clearInterval(scoreLoop);
      //remover a classe running para parar as animações
      gameBoard.classList.remove('running');
      //cogela o cano
      pipe.style.animation = 'none';
      pipe.style.left = `${pipePosition}px`;
      //cogela o mario no exato local e muda a imagem para a de gameover
      mario.style.animation = 'none';
      mario.style.bottom = `${marioPosition}px`;
      mario.scr = '../assets/game-over.png';
      mario.style.width = '75px';
      mario.style.marginLeft = '50px';
      //atualização do modal de gameover
      finalScoreValue.textContent = score
      saveStatusMsg.textContent = 'Salvando a pontuação no banco'
      saveStatusMsg.style.color = '#ffcc00';

      gameoverModal.classList.add('active');
      //salva a pontuação no banco com a função criada
      saveScore(currentPlayer, score);
   }

   function saveScore(playerName, finalScore){
      fetch('salvar_ranking.php',{
         method: 'POST',
         headers: {
            'Content-Type': 'aplication/json'
         },
         body: JSON.stringify({
            nome: playerName,
            pontos: finalScore
         })
      })
      .then(res => res.json())
      .then(data => {
         if(data.status === 'success'){
            saveStatusMsg.textContent = 'Pontuação registrada no banco!';
            saveStatusMsg.style.color = '#10b981';
            if(data.ranking){
               renderRanking(data.ranking, playerName, finalScore);
            }
         } else {
            saveStatusMsg.textContent = (data.message || 'Erro ao registrar');
            saveStatusMsg.style.color = '#ef4444';
         }
      })
      .catch(err => {
         console.error('erro na requisição', err);
         saveStatusMsg.textContent = 'erro ao conectar no servidor.';
         saveStatusMsg.style.color = '#ef4444';
      });
   }
   //busca no ranking atualizado do banco
   function fetchRanking(){
      fecth('obter_ranking.php')
      .then(res => res.json())
      .then(data => {
         if (data.status === 'success' && data.ranking){
            renderRanking(data.ranking);
         }
      })
      .catch(err => console.error('erro ao buscar o ranking', err));
   }
   // vamos atualizar a tabela do ranking no html
   function renderRanking(list, highlightName = null, highlightScore = score){
      if(!rankingBody) return;
      rankingBody.innerHTML = '';
      if(!list || list.length === 0){
         rankingBody.innerHTML = `<tr><td colspan="3" class="loading-cell">nenhuma pontuação gravada ainda.</td></tr>`;
         return;
      }
      let highlightted = false;

      list.forEach((item, index) => {
         const tr = document.createElement('tr');

         if(!highlightted && item.nome === highlightName && parseInt(item.pontos, 10) === highlightScore){
            tr.classList.add('highlight-current');
            highlightted = true;
         }
         let medal = `$(index + 1)º`;
         if (index === 0) medal = '1º';
         else if (index === 2) medal = '2º';
         else if (index === 3) medal = '3º';

         tr.innerHTML = `
            <td class="ranking-pos">${medal}</td>
            <td><strong>${escapeHtml(item.nome)}<strong><td>
            <td>${parseInt(item.pontos, 10)} pts</td>
         `;

         rankingBody.appendChild(tr);
      })
   }

   function escapeHtml(str){
      if(!str) return '';
      return String(str)
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&#039;');
   }
   // eventos de controle e interface do jogo
   //iniciar o jogo
   startForm.addEventListener('submit', (e) => {
      e.preventDefault(); //impede o recarregamento da pagina

      const nameValue = playerInput.value.trim();
      if(!nameValue) {
         playerInput.focus();
         return;
      }

      currentPlayer = nameValue;
      localStorage.setItem('mario_jump_player', currentPlayer);
      //fecha a tela e começa o jogo depois de preencher os dados
      startModal.classList.remove('active');
      startGame();
   });

   //botão ver ranking
// document.addEventListener('click', () => {
//     alert("Você clicou na página!")
// }) isso faz com que o site exiba uma mensagem na sua tela