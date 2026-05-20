// REGISTRO DO SERVICE WORKER PARA O PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('✅ Service Worker registrado com sucesso!', reg))
            .catch(err => console.error('Erro ao registrar o Service Worker:', err));
    });
}

// =========================================================================
// 1. ALTERNADOR DE ABAS (TABS - ESTILO NATIVO)
// =========================================================================
function switchTab(tabId, element) {
    // Esconde todas as telas
    document.querySelectorAll('.app-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostra a tela selecionada
    const targetScreen = document.getElementById(`tab-${tabId}`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // Atualiza o estado visual dos botões da nav bar se o elemento for passado
    if (element) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        element.classList.add('active');
    } else {
        // Se a troca foi via botão interno (ex: card de promoção)
        document.querySelectorAll('.nav-item').forEach(item => {
            const onClickAttr = item.getAttribute('onclick');
            if (onClickAttr && onClickAttr.includes(tabId)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// =========================================================================
// 2. PERSISTÊNCIA REFINADA COM LOCALSTORAGE
// =========================================================================
const inputName = document.getElementById('client-name');
const selectEvent = document.getElementById('event-type');
const inputDate = document.getElementById('event-date');
const inputGuests = document.getElementById('event-guests');
const inputLocation = document.getElementById('event-location');

// Carregar todos os dados salvos assim que a estrutura do app estiver pronta
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('da_client_name') && inputName) {
        inputName.value = localStorage.getItem('da_client_name');
    }
    if (localStorage.getItem('da_event_type') && selectEvent) {
        selectEvent.value = localStorage.getItem('da_event_type');
    }
    if (localStorage.getItem('da_event_date') && inputDate) {
        inputDate.value = localStorage.getItem('da_event_date');
    }
    if (localStorage.getItem('da_event_guests') && inputGuests) {
        inputGuests.value = localStorage.getItem('da_event_guests');
    }
    if (localStorage.getItem('da_event_location') && inputLocation) {
        inputLocation.value = localStorage.getItem('da_event_location');
    }
    
    // Força o carrossel a iniciar na primeira foto corretamente
    if (track && indicators.length > 0) {
        updateCarousel(0);
    }
});

// Ouvintes para salvar as entradas do formulário em tempo real (Prevenção contra refresh)
if (inputName) {
    inputName.addEventListener('input', () => localStorage.setItem('da_client_name', inputName.value));
}
if (selectEvent) {
    selectEvent.addEventListener('change', () => localStorage.setItem('da_event_type', selectEvent.value));
}
if (inputDate) {
    inputDate.addEventListener('change', () => localStorage.setItem('da_event_date', inputDate.value));
}
if (inputGuests) {
    inputGuests.addEventListener('input', () => localStorage.setItem('da_event_guests', inputGuests.value));
}
if (inputLocation) {
    inputLocation.addEventListener('input', () => localStorage.setItem('da_event_location', inputLocation.value));
}

// =========================================================================
// 3. INTEGRAÇÃO AVANÇADA E DISPARO DETALHADO PARA O WHATSAPP
// =========================================================================
function sendWhatsApp(event) {
    event.preventDefault();
    
    const name = inputName.value;
    const eventType = selectEvent.value;
    const rawDate = inputDate.value;
    const guests = inputGuests.value || "Não informado";
    const location = inputLocation.value;
    
    // Formata a data americana (AAAA-MM-DD) para o padrão nacional (DD/MM/AAAA)
    let formattedDate = rawDate;
    if (rawDate) {
        const dateParts = rawDate.split('-');
        formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    }

    // Varre as caixas de seleção da estrutura solicitada
    let selectedItems = [];
    let includesPista = false;

    if (document.getElementById('item-sound').checked) {
        selectedItems.push("🔹 *Sonorização Premium + DJ* (Equipamentos de alta performance)");
    }
    if (document.getElementById('item-light').checked) {
        selectedItems.push("🔹 *Iluminação de Pista & Cênica* (Moving Heads, lasers e refletores)");
    }
    if (document.getElementById('item-pista').checked) {
        selectedItems.push("🔹 *Pista Paris Infinity* (Estrutura de LED com efeito infinito)");
        includesPista = true;
    }
    
    // Validação preventiva para garantir que escolheu algo
    if (selectedItems.length === 0) {
        alert("Por favor, selecione ao menos um item da estrutura para calcular o seu orçamento!");
        return;
    }

    // Texto de referência inteligente com base no interesse do cliente
    let photoReferenceText = "";
    if (includesPista) {
        photoReferenceText = "📌 *Obs:* Fiquei muito interessado no modelo da *Pista Paris Infinity* que vi no aplicativo! Gostaria de ver fotos dela aplicadas em eventos.";
    } else {
        photoReferenceText = "📌 *Obs:* Vi as fotos das estruturas de iluminação e sonorização no aplicativo e gostaria de receber um exemplo voltado para o meu espaço.";
    }

    // Montagem final do layout da mensagem com Emojis
    const phoneNumber = "5521988610506"; // Telefone principal da D&A Som e Luz
    const message = 
`⚡ *NOVA SOLICITAÇÃO DE ORÇAMENTO* ⚡
-----------------------------------------
Olá, D&A Som e Luz! Acabei de simular meu evento pelo aplicativo e gostaria de verificar a disponibilidade da data.

👤 *CLIENTE:* ${name}
🎉 *EVENTO:* ${eventType}
📅 *DATA:* ${formattedDate}
👥 *CONVIDADOS:* ${guests} pessoas
📍 *LOCAL:* ${location}

🛠️ *ESTRUTURA SOLICITADA:*
${selectedItems.join('\n')}

-----------------------------------------
${photoReferenceText}

Seus dados foram gerados pelo Simulador PWA.`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    
    // Abre o chat no aplicativo do WhatsApp com o texto pronto para envio
    window.open(whatsappUrl, '_blank');
}

// =========================================================================
// 4. LÓGICA REFINADA DO CARROSSEL AUTOMÁTICO DE IMAGENS
// =========================================================================
const track = document.getElementById('carouselTrack');
const indicators = document.querySelectorAll('.indicator');
let currentSlideIndex = 0;
const totalSlides = indicators.length;
const slideInterval = 4000; // Tempo de exibição de cada foto (4 segundos)

function updateCarousel(index) {
    if (!track) return;
    
    // Desloca a trilha horizontalmente de acordo com a foto ativa (0 = 0%, 1 = -100%, etc.)
    track.style.transform = `translateX(-${index * 100}%)`;
    
    // Atualiza o estado dos mini indicadores (pontinhos)
    indicators.forEach(indicator => indicator.classList.remove('active'));
    if (indicators[index]) {
        indicators[index].classList.add('active');
    }
    
    currentSlideIndex = index;
}

// Vincula o evento de clique manual nos pontinhos do carrossel
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        updateCarousel(index);
        restartAutoSlide(); // Redefine o temporizador para evitar passagens bruscas imediatas
    });
});

// Temporizador ativo do carrossel automático
let autoSlideTimer = setInterval(() => {
    if (totalSlides > 0) {
        let nextIndex = (currentSlideIndex + 1) % totalSlides;
        updateCarousel(nextIndex);
    }
}, slideInterval);

// Função auxiliar para redefinir o cronômetro após cliques do usuário
function restartAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => {
        if (totalSlides > 0) {
            let nextIndex = (currentSlideIndex + 1) % totalSlides;
            updateCarousel(nextIndex);
        }
    }, slideInterval);
}















/* código para instalar o aplicativo */
  let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installButton = document.createElement('button');
    installButton.innerText = 'Instalar App';
    installButton.style.position = 'fixed';
    installButton.style.bottom = '10px';
    installButton.style.right = '10px';
    document.body.appendChild(installButton);
    installButton.addEventListener('click', () => {
        deferredPrompt.prompt();
   deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
   console.log('Usuário aceitou instalar o app');
            } else {
   console.log('Usuário rejeitou instalar o app');
            }
            deferredPrompt = null;
            installButton.remove();
        });
    });
});
setTimeout(() => {
    if (deferredPrompt && installButton) {
        installButton.remove();
        console.log('Botão de instalação removido por inatividade.');
    }
}, 15000);