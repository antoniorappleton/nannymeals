
// onboarding.js - Navegação entre passos do perfil

(function() {
  function runOnboarding() {
    const steps = [
      document.getElementById('setup-step-1'),
      document.getElementById('setup-step-2'),
      document.getElementById('setup-step-3'),
      document.getElementById('setup-step-4')
    ];
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const stepLabel = document.getElementById('step-label');
    const progressBar = document.getElementById('progress-bar');

    let currentStep = 0;

    function showStep(idx) {
      steps.forEach((step, i) => {
        if (step) step.classList.toggle('hidden', i !== idx);
      });
      btnPrev.classList.toggle('hidden', idx === 0);
      btnNext.textContent = idx === steps.length - 1 ? 'Concluir' : 'Seguinte';
      stepLabel.textContent = `Passo ${idx + 1} de 4`;
      progressBar.style.width = `${((idx + 1) / steps.length) * 100}%`;
      // Scroll para topo do main
      const main = document.querySelector('main');
      if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    }

    btnPrev.addEventListener('click', function() {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });

    btnNext.addEventListener('click', function() {
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      } else {
        // Concluir plano: pode adicionar lógica de submissão aqui
        alert('Plano concluído!');
      }
    });

    showStep(currentStep);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runOnboarding);
  } else {
    runOnboarding();
  }
})();
