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















// VARIÁVEL GLOBAL PARA GUARDAR O EVENTO DE INSTALAÇÃO
let deferredPrompt;
const installContainer = document.getElementById('install-container');
const btnInstallPwa = document.getElementById('btn-install-pwa');

// 1. ESCUTA O EVENTO QUE O NAVEGADOR DISPARA QUANDO DETECTA QUE O SITE É UM PWA INSTALÁVEL
window.addEventListener('beforeinstallprompt', (e) => {
    // Previne o navegador de mostrar o banner padrão (pop-up feio de navegador)
    e.preventDefault();
    
    // Guarda o evento para ser executado quando o usuário clicar no seu botão
    deferredPrompt = e;
    
    // Mostra o seu container/botão estilizado com o tema do app
    if (installContainer) {
        installContainer.style.display = 'block';
    }
});

// 2. LOGICA DE CLIQUE NO SEU BOTÃO CUSTOMIZADO
if (btnInstallPwa) {
    btnInstallPwa.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        // Mostra o prompt de instalação nativo do sistema operacional (Android/iOS/Windows)
        deferredPrompt.prompt();
        
        // Aguarda a resposta do usuário (se aceitou ou recusou)
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Escolha do usuário para instalação: ${outcome}`);
        
        // Limpa a variável, pois o prompt só pode ser usado uma vez
        deferredPrompt = null;
        
        // Esconde o botão novamente já que a ação foi tomada
        if (installContainer) {
            installContainer.style.display = 'none';
        }
    });
}

// 3. ESCUTA SE O APLICATIVO JÁ FOI INSTALADO COM SUCESSO
window.addEventListener('appinstalled', (evt) => {
    console.log('D&A Som e Luz foi instalado com sucesso na tela inicial!');
    // Garante que o botão suma após a instalação concluída
    if (installContainer) {
        installContainer.style.display = 'none';
    }
});