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
})

// document.addEventListener('click', () => {
//     alert("Você clicou na página!")
// }) isso faz com que o site exiba uma mensagem na sua tela