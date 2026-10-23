      const resultMessage = document.getElementById('resultMessage');
      const riddleProgress = document.getElementById('riddleProgress');
      const riddleQuestion = document.getElementById('riddleQuestion');
      const riddleEncouragement = document.getElementById('riddleEncouragement');
      const riddleAnswer = document.getElementById('riddleAnswer');
      const riddleForm = document.getElementById('riddleForm');
      const checkAnswersBtn = document.getElementById('checkAnswersBtn');
      const tourProgress = document.getElementById('tourProgress');
      const artworkViewer = document.getElementById('artworkViewer');
      const artworkReturn = document.getElementById('artworkReturn');
      const expandedArtwork = document.getElementById('expandedArtwork');
      const projectCards = [...document.querySelectorAll('.project-card')];
      const expandedArtworkImage = document.getElementById('expandedArtworkImage');
      const riddles = [
        {
          question: 'I have keys but no locks, space but no room. You can enter, but not go in. What am I?',
          answer: 'keyboard'
        },
        {
          question: 'The more you take, the more you leave behind. What are they?',
          answer: 'footsteps'
        },
        {
          question: 'What has hands but cannot clap?',
          answer: 'clock'
        }
      ];
      let currentRiddle = 0;
      let currentAnswerCorrect = false;
      let progressFrame = 0;
      let activeProjectCard = null;
      let isArtworkTransitioning = false;
      let previousBodyOverflow = '';

      function renderRiddle() {
        riddleProgress.textContent = `Riddle ${currentRiddle + 1} of ${riddles.length}`;
        riddleQuestion.textContent = riddles[currentRiddle].question;
        riddleEncouragement.textContent = 'Take a guess whenever you’re ready.';
        riddleAnswer.value = '';
        riddleAnswer.disabled = false;
        checkAnswersBtn.textContent = 'Check answer';
        resultMessage.textContent = '';
        resultMessage.className = 'result';
        currentAnswerCorrect = false;
      }

      function updateTourProgress() {
        if (progressFrame) return;
        progressFrame = requestAnimationFrame(() => {
          const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
          tourProgress.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
          progressFrame = 0;
        });
      }

      function animateArtworkToCard(card, opening) {
        const cardVisual = card.querySelector('.project-visual');
        const fromRect = opening ? cardVisual.getBoundingClientRect() : artworkReturn.getBoundingClientRect();
        const toRect = opening ? artworkReturn.getBoundingClientRect() : cardVisual.getBoundingClientRect();
        const translateX = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
        const translateY = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);
        const scaleX = toRect.width / fromRect.width;
        const scaleY = toRect.height / fromRect.height;
        const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 850;
        const animation = artworkReturn.animate(
          opening
            ? [
                { transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})` },
                { transform: 'translate(0, 0) scale(1, 1)' }
              ]
            : [
                { transform: 'translate(0, 0) scale(1, 1)' },
                { transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})` }
              ],
          { duration, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'both' }
        );
        const visualAnimation = expandedArtworkImage.animate(
          opening
            ? [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(360deg)' }]
            : [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-360deg)' }],
          { duration, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'both' }
        );
        return Promise.all([animation.finished, visualAnimation.finished]);
      }

      async function openArtwork(card) {
        if (isArtworkTransitioning) return;
        isArtworkTransitioning = true;
        activeProjectCard = card;
        const sourceVisual = card.querySelector('.project-visual');
        expandedArtwork.style.background = getComputedStyle(sourceVisual).background;
        const sourceImage = sourceVisual.querySelector('.project-image');
        expandedArtworkImage.src = sourceImage.src;
        expandedArtworkImage.alt = sourceImage.alt;
        artworkViewer.hidden = false;
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        await animateArtworkToCard(card, true);
        artworkReturn.focus();
        isArtworkTransitioning = false;
      }

      async function closeArtwork() {
        if (!activeProjectCard || isArtworkTransitioning) return;
        isArtworkTransitioning = true;
        await animateArtworkToCard(activeProjectCard, false);
        artworkViewer.hidden = true;
        document.body.style.overflow = previousBodyOverflow;
        activeProjectCard.focus();
        activeProjectCard = null;
        isArtworkTransitioning = false;
      }

      riddleForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (currentAnswerCorrect) {
          currentRiddle = currentRiddle < riddles.length - 1 ? currentRiddle + 1 : 0;
          renderRiddle();
          riddleAnswer.focus();
          return;
        }

        const answer = riddleAnswer.value.trim().toLowerCase();
        if (answer === riddles[currentRiddle].answer) {
          currentAnswerCorrect = true;
          riddleAnswer.disabled = true;
          resultMessage.textContent = 'Correct! Nice one.';
          resultMessage.className = 'result success';
          riddleEncouragement.textContent = currentRiddle < riddles.length - 1
            ? 'You got it! Ready for the next one?'
            : 'You solved all three. Want to play again?';
          checkAnswersBtn.textContent = currentRiddle < riddles.length - 1
            ? 'Next riddle'
            : 'Play again';
          return;
        }

        resultMessage.textContent = 'Not quite. Give it another try.';
        resultMessage.className = 'result error';
      });

      projectCards.forEach((card) => {
        card.addEventListener('click', (event) => {
          if (event.target.closest('.image-credit')) return;
          openArtwork(card);
        });
        card.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openArtwork(card);
          }
        });
      });
      artworkReturn.addEventListener('click', closeArtwork);
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && activeProjectCard) closeArtwork();
      });

      window.addEventListener('scroll', updateTourProgress, { passive: true });
      window.addEventListener('resize', updateTourProgress);
      renderRiddle();
      document.getElementById('year').textContent = new Date().getFullYear();
    
