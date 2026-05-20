// REGISTRO DO SERVICE WORKER PARA O PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('✅ Service Worker registrado com sucesso!', reg))
            .catch(err => console.error('Erro ao registrar o Service Worker:', err));
    });
}

// =========================================================================
// 1. ALTERNADOR DE ABAS COM SELEÇÃO DINÂMICA DE CHECKBOX
// =========================================================================
function switchTab(tabId, element, checkboxId) {
    // Esconde todas as telas
    document.querySelectorAll('.app-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostra a tela selecionada
    const targetScreen = document.getElementById(`tab-${tabId}`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // Se um ID de checkbox foi passado, marca ele automaticamente
    if (checkboxId) {
        const targetCheckbox = document.getElementById(checkboxId);
        if (targetCheckbox) {
            targetCheckbox.checked = true;
            // Opcional: Se quiser disparar um evento para salvar o estado caso use ouvintes nos checkboxes
            targetCheckbox.dispatchEvent(new Event('change'));
        }
    }
    
    // Atualiza o estado visual dos botões da nav bar se o elemento for passado
    if (element) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        element.classList.add('active');
    } else {
        // Se a troca foi via botão interno (ex: card de promoção ou galeria de serviços)
        document.querySelectorAll('.nav-item').forEach(item => {
            const onClickAttr = item.getAttribute('onclick');
            if (onClickAttr && onClickAttr.includes(tabId)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Rola a tela para o topo para garantir uma boa experiência de navegação nativa
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
// 3. INTEGRAÇÃO AVANÇADA E DISPARO DETALHADO PARA O WHATSAPP (COM VALIDAÇÃO VISUAL)
// =========================================================================
function sendWhatsApp(event) {
    event.preventDefault();
    
    // Remove marcações de erro antigas antes de validar novamente
    const inputs = [inputName, inputDate, inputLocation];
    inputs.forEach(input => {
        if (input) input.classList.remove('input-error');
    });

    // 1. Validação dos campos de texto obrigatórios
    let hasError = false;
    
    if (inputName && !inputName.value.trim()) {
        inputName.classList.add('input-error');
        hasError = true;
    }
    if (inputDate && !inputDate.value) {
        inputDate.classList.add('input-error');
        hasError = true;
    }
    if (inputLocation && !inputLocation.value.trim()) {
        inputLocation.classList.add('input-error');
        hasError = true;
    }

    // Se houver erro em algum campo de texto, cria e exibe o aviso flutuante personalizado
    if (hasError) {
        let toast = document.getElementById('validation-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'validation-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #ff3333;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: bold;
                z-index: 10000;
                box-shadow: 0 4px 15px rgba(255, 51, 51, 0.4);
                font-size: 0.95rem;
                text-align: center;
                width: 85%;
                max-width: 350px;
                animation: shakeError 0.4s ease-in-out;
            `;
            document.body.appendChild(toast);
        }
        toast.innerText = "⚠️ Por favor, preencha todos os campos obrigatórios em destaque!";
        toast.style.backgroundColor = '#ff3333';
        toast.style.color = 'white';
        toast.style.display = 'block';
        
        // Esconde o aviso após 4 segundos
        setTimeout(() => {
            toast.style.display = 'none';
        }, 4000);
        
        return;
    }
    
    const name = inputName.value;
    const eventType = selectEvent ? selectEvent.value : "Não informado";
    const rawDate = inputDate.value;
    const guests = (inputGuests && inputGuests.value) ? inputGuests.value : "Não informado";
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
    
    // 2. Validação preventiva das caixas de seleção (Estruturas)
    if (selectedItems.length === 0) {
        let toast = document.getElementById('validation-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'validation-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: bold;
                z-index: 10000;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                font-size: 0.95rem;
                text-align: center;
                width: 85%;
                max-width: 350px;
            `;
            document.body.appendChild(toast);
        }
        toast.innerText = "🛠️ Selecione ao menos uma estrutura para o orçamento!";
        toast.style.backgroundColor = '#ffcc00';
        toast.style.color = '#000000';
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 4000);
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

// CONTROLADOR DE INSTALAÇÃO DO PWA
let deferredPrompt;
const installContainer = document.getElementById('install-container');
const btnInstallPwa = document.getElementById('btn-install-pwa');

// 1. Intercepta o evento padrão do navegador
window.addEventListener('beforeinstallprompt', (e) => {
    // Impede que o banner padrão do navegador apareça do nada
    e.preventDefault();
    
    // Guarda o evento na variável global para usar no clique do botão
    deferredPrompt = e;
    
    // Faz a sua div customizada aparecer na tela com estilo
    if (installContainer) {
        installContainer.style.display = 'block';
    }
});

// 2. Lógica de clique no botão de instalação
if (btnInstallPwa) {
    btnInstallPwa.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        // Dispara o prompt nativo do sistema operacional (Android, iOS ou Windows)
        deferredPrompt.prompt();
        
        // Aguarda a resposta do cliente
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Resposta do usuário para a instalação: ${outcome}`);
        
        // Limpa a variável porque o prompt só pode ser disparado uma vez por evento
        deferredPrompt = null;
        
        // Esconde o botão após a ação do usuário
        if (installContainer) {
            installContainer.style.display = 'none';
        }
    });
}

// 3. Monitora se o app foi instalado com sucesso
window.addEventListener('appinstalled', (evt) => {
    console.log('O aplicativo D&A Som e Luz foi instalado com sucesso!');
    // Garante que o botão suma de vez caso o usuário tenha instalado por outro método
    if (installContainer) {
        installContainer.style.display = 'none';
    }
});