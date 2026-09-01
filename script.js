// ================= CONFIGURAÇÃO DO SUPABASE =================
const supabaseUrl = 'https://euulzozlzhudfwehdjkv.supabase.co'; 
const supabaseKey = 'sb_publishable_z_eqNXUQMX1fcrjXDFLjYg_6uQ7eYw1';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// 1. CARREGAR CATÁLOGO DO SUPABASE

async function carregarProdutosDoServidor() {
    const gridVestidos = document.getElementById('grid-vestidos');
    const gridConjuntos = document.getElementById('grid-conjuntos');
    const gridBlusas = document.getElementById('grid-blusas');
    const gridCalcas = document.getElementById('grid-calcas'); 
    const gridBlusasPersonalizadas = document.getElementById('grid-blusas-personalizadas');
    const gridBiquinis = document.getElementById('grid-biquinis');
    const gridPlusSize = document.getElementById('grid-plus-size');
    const gridNatal = document.getElementById('grid-natal');
    const gridAnoNovo = document.getElementById('grid-ano-novo');
    
    const loadingDiv = document.getElementById('loading-catalogo'); 
    const conteudoCatalogo = document.getElementById('conteudo-catalogo'); 

    if (!gridVestidos && !gridConjuntos && !gridBlusas && !gridBiquinis) return;

    try {
        const { data: produtos, error } = await supabaseClient
            .from('produtos')
            .select('*')
            .order('dataCadastro', { ascending: false });
            
        if (error) throw error;

        if (loadingDiv && conteudoCatalogo) {
            loadingDiv.style.opacity = '0';
            setTimeout(() => {
                loadingDiv.style.display = 'none';
                conteudoCatalogo.style.opacity = '1';
            }, 400);
        }

        if(gridVestidos) gridVestidos.innerHTML = '';
        if(gridConjuntos) gridConjuntos.innerHTML = '';
        if(gridBlusas) gridBlusas.innerHTML = '';
        if(gridCalcas) gridCalcas.innerHTML = '';
        if(gridBlusasPersonalizadas) gridBlusasPersonalizadas.innerHTML = '';
        if(gridBiquinis) gridBiquinis.innerHTML = '';
        if(gridPlusSize) gridPlusSize.innerHTML = '';
        if(gridNatal) gridNatal.innerHTML = '';
        if(gridAnoNovo) gridAnoNovo.innerHTML = '';
        
        const NUMERO_ZAP = "5582993620937";

        produtos.forEach((produto) => {
            const listaTamanhos = produto.tamanhos || ['M'];
            const textoTamanhos = listaTamanhos.join(', ');
            const htmlTamanhos = listaTamanhos.map(tam => `<span class="size-badge">${tam}</span>`).join('');
            const tamanhosTexto = listaTamanhos.join(',');

            const cardHTML = `
                <div class="catalog-card">
                    <div class="img-placeholder" onclick="abrirZoom('${produto.imagemUrl}')" style="cursor: zoom-in;">
                        <img src="${produto.imagemUrl}" alt="${produto.nome}">
                    </div>
                    <div class="catalog-info">
                        <h4>${produto.nome}</h4>
                        <div class="sizes-container">
                            ${htmlTamanhos}
                        </div>
                        <div class="price-container">
                            ${produto.precoAntigo ? `<span class="old-price">R$ ${produto.precoAntigo}</span>` : ''}
                            <span class="new-price">apenas: <strong>R$ ${produto.preco}</strong></span>
                        </div>
                        <div class="card-actions">
                            <button type="button" class="btn-light add-cart-btn" onclick="abrirModalSelecao('carrinho', '${produto.nome}', '${produto.preco}', '${produto.imagemUrl}', '${tamanhosTexto}', '${NUMERO_ZAP}')">
                                <i class="ph ph-shopping-cart-plus"></i> Adicionar ao carrinho
                            </button>
                            <button type="button" class="btn-outline-card" onclick="abrirModalSelecao('comprar', '${produto.nome}', '${produto.preco}', '${produto.imagemUrl}', '${tamanhosTexto}', '${NUMERO_ZAP}')">
                                Comprar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            if (produto.categoria === 'vestidos' && gridVestidos) gridVestidos.innerHTML += cardHTML;
            if (produto.categoria === 'conjuntos' && gridConjuntos) gridConjuntos.innerHTML += cardHTML;
            if (produto.categoria === 'blusas' && gridBlusas) gridBlusas.innerHTML += cardHTML;
            if (produto.categoria === 'calcas' && gridCalcas) gridCalcas.innerHTML += cardHTML;
            if (produto.categoria === 'blusas-personalizadas' && gridBlusasPersonalizadas) gridBlusasPersonalizadas.innerHTML += cardHTML;
            if (produto.categoria === 'biquinis' && gridBiquinis) gridBiquinis.innerHTML += cardHTML;
            if (produto.categoria === 'plus-size' && gridPlusSize) gridPlusSize.innerHTML += cardHTML;
            if (produto.categoria === 'natal' && gridNatal) gridNatal.innerHTML += cardHTML;
            if (produto.categoria === 'ano-novo' && gridAnoNovo) gridAnoNovo.innerHTML += cardHTML;
        });

        iniciarCarrosseis();
        iniciarHoverMobileCards();
    } catch (erro) {
        console.error("Erro ao carregar do Supabase:", erro);
    }
}

// 2. CARREGAR DESTAQUES DA HERO
let destaquesData = [];
let currentFeaturedIndex = 0;

async function carregarDestaquesHero() {
    try {
        const { data: destaques, error } = await supabaseClient
            .from('destaques')
            .select('*')
            .order('dataCadastro', { ascending: false })
            .limit(5);
            
        if (error) throw error;
        destaquesData = destaques;

        if (destaquesData.length === 0) {
            destaquesData = [
                { imagemUrl: 'img/Vestido.webp', titulo: 'Vestido Lavanda', descricao: 'Elegância que<br>encanta', preco: '259,90' }
            ];
        }

        updateFeaturedCard(0);
    } catch (erro) {
        console.error("Erro ao carregar destaques da Hero:", erro);
    }
}

function updateFeaturedCard(index) {
    const featuredContent = document.getElementById('featured-content');
    const fImg = document.getElementById('featured-img');
    const fTitle = document.getElementById('featured-title');
    const fDesc = document.getElementById('featured-desc');
    const fPrice = document.getElementById('featured-price');

    if(!featuredContent || destaquesData.length === 0) return;

    featuredContent.classList.add('fade-out');
    setTimeout(() => {
        fImg.src = destaquesData[index].imagemUrl;
        fTitle.innerHTML = destaquesData[index].titulo;
        fDesc.innerHTML = destaquesData[index].descricao;
        fPrice.innerHTML = `R$ ${destaquesData[index].preco}`;
        featuredContent.classList.remove('fade-out');
    }, 300);
}

// 4. MÚLTIPLOS CARROSSÉIS INDEPENDENTES
function iniciarCarrosseis() {
    const allCarousels = document.querySelectorAll('.category-carousel-block');
    
    allCarousels.forEach((carousel) => {
        const trackContainer = carousel.querySelector('.carousel-track-container');
        const track = carousel.querySelector('.product-grid');
        const nextBtn = carousel.querySelector('.next-arrow');
        const prevBtn = carousel.querySelector('.prev-arrow');

        let isAnimating = false; 

        if (track && nextBtn && prevBtn && track.firstElementChild) {
            
            nextBtn.onclick = () => {
                if (isAnimating) return;
                isAnimating = true;

                const cardWidth = track.firstElementChild.offsetWidth;
                const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
                const moveDistance = cardWidth + gap;

                trackContainer.scrollTo({
                    left: trackContainer.scrollLeft + moveDistance, 
                    behavior: 'smooth'
                });

                setTimeout(() => {
                    trackContainer.style.scrollBehavior = 'auto';
                    trackContainer.style.scrollSnapType = 'none';

                    track.appendChild(track.firstElementChild);
                    trackContainer.scrollLeft -= moveDistance;

                    setTimeout(() => {
                        trackContainer.style.scrollBehavior = 'smooth';
                        trackContainer.style.scrollSnapType = 'x mandatory';
                        isAnimating = false;
                    }, 50);
                }, 400); 
            };

            prevBtn.onclick = () => {
                if (isAnimating) return;
                isAnimating = true;

                const cardWidth = track.firstElementChild.offsetWidth;
                const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
                const moveDistance = cardWidth + gap;

                trackContainer.style.scrollBehavior = 'auto';
                trackContainer.style.scrollSnapType = 'none';

                track.insertBefore(track.lastElementChild, track.firstElementChild);
                trackContainer.scrollLeft += moveDistance;

                setTimeout(() => {
                    trackContainer.style.scrollBehavior = 'smooth';
                    trackContainer.style.scrollSnapType = 'x mandatory';

                    trackContainer.scrollTo({
                        left: trackContainer.scrollLeft - moveDistance,
                        behavior: 'smooth'
                    });

                    setTimeout(() => {
                        isAnimating = false;
                    }, 400); 
                }, 50);
            };
        }
    });
}

// ================= INICIALIZADOR GERAL E EVENTOS =================
document.addEventListener('DOMContentLoaded', () => {

    // ================= MENU MOBILE =================
    const btnMenuMobile = document.querySelector('.mobile-menu-btn');
    const navLinksMenu = document.querySelector('.nav-links');
    const iconeMenu = btnMenuMobile ? btnMenuMobile.querySelector('i') : null;
    const linksDoMenu = navLinksMenu ? navLinksMenu.querySelectorAll('a') : [];

    if (btnMenuMobile && navLinksMenu) {
        
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);

        const logoMobile = document.createElement('img');
        logoMobile.src = 'img/Logo.webp'; 
        logoMobile.alt = 'Floré Boutique';
        logoMobile.className = 'logo-menu-mobile';
        navLinksMenu.insertBefore(logoMobile, navLinksMenu.firstChild);

        function fecharMenuMobile() {
            navLinksMenu.classList.remove('menu-aberto');
            overlay.classList.remove('ativo');
            if(iconeMenu) {
                iconeMenu.classList.remove('ph-x');
                iconeMenu.classList.add('ph-list');
            }
        }

        btnMenuMobile.addEventListener('click', () => {
            const estaAberto = navLinksMenu.classList.contains('menu-aberto');
            
            if (!estaAberto) {
                navLinksMenu.classList.add('menu-aberto');
                overlay.classList.add('ativo');
                iconeMenu.classList.remove('ph-list');
                iconeMenu.classList.add('ph-x');
            } else {
                fecharMenuMobile();
            }
        });

        overlay.addEventListener('click', fecharMenuMobile);

        linksDoMenu.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault(); 
                const targetId = this.getAttribute('href');
                fecharMenuMobile();
                
                setTimeout(() => {
                    const targetSection = document.querySelector(targetId);
                    if (targetSection) {
                        const offsetNavbar = window.innerHeight * 0.11; 
                        const posicaoExata = targetSection.getBoundingClientRect().top + window.scrollY - offsetNavbar;
                        
                        window.scrollTo({
                            top: posicaoExata,
                            behavior: 'smooth'
                        });
                    }
                }, 300);
            });
        });
    }

    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    const nextBtnFeatured = document.getElementById('next-featured');
    const prevBtnFeatured = document.getElementById('prev-featured');
    if(nextBtnFeatured && prevBtnFeatured) {
        nextBtnFeatured.addEventListener('click', () => {
            if(destaquesData.length === 0) return;
            currentFeaturedIndex = (currentFeaturedIndex + 1) % destaquesData.length;
            updateFeaturedCard(currentFeaturedIndex);
        });
        prevBtnFeatured.addEventListener('click', () => {
            if(destaquesData.length === 0) return;
            currentFeaturedIndex = (currentFeaturedIndex - 1 + destaquesData.length) % destaquesData.length;
            updateFeaturedCard(currentFeaturedIndex);
        });
    }

    const inputBusca = document.querySelector('.search-box input');
    const btnVerTodosSuperior = document.querySelector('.btn-ver-mais');
    const selectFiltro = document.querySelector('.filter-dropdown');
    const todosCarrosseis = document.querySelectorAll('.category-carousel-block');
    const msgVazia = document.getElementById('mensagem-pesquisa-vazia');
    const btnLimparBusca = document.getElementById('btn-limpar-busca');
    let modoVerTodosAtivo = false;
    let categoriaFiltrada = 'todos';

    function animarCardsVisiveis(cards) {
        cards.forEach((card) => {
            if (card.style.display !== 'none') {
                card.classList.remove('animar-entrada');
                void card.offsetWidth; 
                card.classList.add('animar-entrada');
            }
        });
    }

    function alternarModoGrade(bloco, ativar) {
        const setinhas = bloco.querySelectorAll('.carousel-arrow');
        const trilha = bloco.querySelector('.carousel-track-container');
        const grade = bloco.querySelector('.product-grid');
        const btnVazado = bloco.querySelector('.btn-vazado-filtro');
        if (ativar) {
            setinhas.forEach(s => s.classList.add('oculto-pesquisa'));
            if (trilha) trilha.classList.add('modo-grade');
            if (grade) grade.classList.add('modo-grade');
            if (btnVazado) btnVazado.innerHTML = 'Ver menos <i class="ph ph-caret-up"></i>';
        } else {
            setinhas.forEach(s => s.classList.remove('oculto-pesquisa'));
            if (trilha) trilha.classList.remove('modo-grade');
            if (grade) grade.classList.remove('modo-grade');
            if (btnVazado) btnVazado.innerHTML = 'Ver todos <i class="ph ph-caret-down"></i>';
        }
    }

    if (selectFiltro) {
        selectFiltro.addEventListener('change', function(e) {
            categoriaFiltrada = e.target.value.toLowerCase();
            modoVerTodosAtivo = false; 

            todosCarrosseis.forEach(bloco => {
                const catBloco = bloco.getAttribute('data-categoria');
                const containerBtnVazado = bloco.querySelector('.container-btn-filtro');
                const cards = bloco.querySelectorAll('.catalog-card');

                alternarModoGrade(bloco, false);

                if (categoriaFiltrada === 'todos') {
                    bloco.style.display = 'block';
                    if (containerBtnVazado) containerBtnVazado.style.display = 'none';
                    if (btnVerTodosSuperior) {
                        btnVerTodosSuperior.style.display = 'inline-flex';
                        btnVerTodosSuperior.classList.remove('oculto-pesquisa');
                        btnVerTodosSuperior.innerHTML = 'Ver todos <i class="ph ph-caret-down"></i>';
                    }
                } else if (catBloco === categoriaFiltrada) {
                    bloco.style.display = 'block';
                    if (containerBtnVazado) {
                        containerBtnVazado.classList.remove('oculto-pesquisa');
                        containerBtnVazado.style.setProperty('display', 'block', 'important');
                    }
                    if (btnVerTodosSuperior) {
                        btnVerTodosSuperior.style.display = 'none';
                        btnVerTodosSuperior.classList.add('oculto-pesquisa');
                    }
                    animarCardsVisiveis(cards);
                } else {
                    bloco.style.display = 'none';
                }
            });
        });
    }

    const botoesVazados = document.querySelectorAll('.btn-vazado-filtro');
    botoesVazados.forEach(btn => {
        btn.addEventListener('click', function() {
            const blocoPai = this.closest('.category-carousel-block');
            const trilha = blocoPai.querySelector('.carousel-track-container');
            const estaEmGrade = trilha.classList.contains('modo-grade');
            const cards = blocoPai.querySelectorAll('.catalog-card');

            alternarModoGrade(blocoPai, !estaEmGrade);
            animarCardsVisiveis(cards);

            if (estaEmGrade) {
                setTimeout(() => {
                    blocoPai.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 150);
            }
        });
    });

    if (btnVerTodosSuperior) {
        btnVerTodosSuperior.addEventListener('click', () => {
            modoVerTodosAtivo = !modoVerTodosAtivo;

            todosCarrosseis.forEach(bloco => {
                const cards = bloco.querySelectorAll('.catalog-card');
                alternarModoGrade(bloco, modoVerTodosAtivo);
                animarCardsVisiveis(cards);
            });

            if (modoVerTodosAtivo) {
                btnVerTodosSuperior.innerHTML = 'Ver menos <i class="ph ph-caret-up"></i>';
            } else {
                btnVerTodosSuperior.innerHTML = 'Ver todos <i class="ph ph-caret-down"></i>';
                setTimeout(() => {
                    const secaoColecoes = document.querySelector('.collections-section');
                    if (secaoColecoes) {
                        secaoColecoes.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 150);
            }
        });
    }

    if (inputBusca) {
        inputBusca.addEventListener('input', function(e) {
            const termo = e.target.value.trim().toLowerCase();
            const pesquisando = termo.length > 0;
            let totalGeralEncontrado = 0;

            todosCarrosseis.forEach(bloco => {
                const catBloco = bloco.getAttribute('data-categoria');
                const titulo = bloco.querySelector('.category-title');
                const containerBtnVazado = bloco.querySelector('.container-btn-filtro');
                const cards = bloco.querySelectorAll('.catalog-card');
                
                if (categoriaFiltrada !== 'todos' && catBloco !== categoriaFiltrada) {
                    bloco.style.display = 'none';
                    return;
                }

                let temCardVisivelNoBloco = false;

                if (pesquisando) {
                    if (titulo) titulo.classList.add('oculto-pesquisa');
                    if (btnVerTodosSuperior) btnVerTodosSuperior.classList.add('oculto-pesquisa');
                    if (containerBtnVazado) containerBtnVazado.classList.add('oculto-pesquisa');
                    
                    alternarModoGrade(bloco, true);

                    cards.forEach(card => {
                        const nomeProduto = card.querySelector('h4').innerText.toLowerCase();
                        if (nomeProduto.includes(termo)) {
                            card.style.display = 'flex';
                            temCardVisivelNoBloco = true;
                            totalGeralEncontrado++;
                        } else {
                            card.style.display = 'none';
                        }
                    });
                    bloco.style.display = temCardVisivelNoBloco ? 'block' : 'none';
                    if (temCardVisivelNoBloco) animarCardsVisiveis(cards);
                } else {
                    if (titulo) titulo.classList.remove('oculto-pesquisa');
                    cards.forEach(card => card.style.display = 'flex');
                    bloco.style.display = 'block';

                    if (categoriaFiltrada === 'todos') {
                        if (btnVerTodosSuperior) {
                            btnVerTodosSuperior.style.display = 'inline-flex';
                            btnVerTodosSuperior.classList.remove('oculto-pesquisa');
                        }
                        if (!modoVerTodosAtivo) alternarModoGrade(bloco, false);
                    } else {
                        if (containerBtnVazado) {
                            containerBtnVazado.classList.remove('oculto-pesquisa');
                            containerBtnVazado.style.setProperty('display', 'block', 'important');
                        }
                        const trilha = bloco.querySelector('.carousel-track-container');
                        const estaEmGrade = trilha.classList.contains('modo-grade');
                        alternarModoGrade(bloco, estaEmGrade);
                    }
                    animarCardsVisiveis(cards);
                }
            });
            if (pesquisando && totalGeralEncontrado === 0) {
                if (msgVazia) msgVazia.classList.remove('oculto-pesquisa');
            } else {
                if (msgVazia) msgVazia.classList.add('oculto-pesquisa');
            }
        });
    }

    if (btnLimparBusca && inputBusca) {
        btnLimparBusca.addEventListener('click', () => {
            inputBusca.value = ''; 
            inputBusca.dispatchEvent(new Event('input')); 
            inputBusca.focus(); 
        });
    }

    const modalSelecao = document.getElementById('modal-selecao-produto');
    const passo1 = document.getElementById('modal-passo-1');
    const passo2 = document.getElementById('modal-passo-2');
    const headerPasso1 = document.getElementById('modal-passo-1-header');
    
    const btnProsseguir1 = document.getElementById('btn-prosseguir-passo1');
    const btnVoltar1 = document.getElementById('btn-voltar-passo1');
    const inputQtd = document.getElementById('input-quantidade');
    const inputNome = document.getElementById('input-nome-cliente');
    const selectPagamento = document.getElementById('select-forma-pagamento');
    const indicadorProgresso = document.getElementById('indicador-progresso-tamanhos');
    
    let modoAtual = 'carrinho';
    let pecaAtual = {};
    let distribuicaoTamanhos = {}; 

    window.abrirModalSelecao = function(tipo, nome, preco, imagemUrl, tamanhosStr, numZap) {
        modoAtual = tipo;
        pecaAtual = { nome, preco, imagemUrl, numZap, arrayTamanhos: tamanhosStr.split(',') };

        passo1.classList.remove('escondido');
        headerPasso1.classList.remove('escondido');
        passo2.classList.add('escondido');
        inputQtd.value = 1;
        inputNome.value = '';
        document.getElementById('modal-produto-nome').innerText = nome;
        document.getElementById('modal-produto-preco').innerText = `R$ ${preco}`;
        document.getElementById('modal-produto-img').src = imagemUrl;
        
        distribuicaoTamanhos = {};
        const primeiroTam = pecaAtual.arrayTamanhos[0].trim();
        distribuicaoTamanhos[primeiroTam] = 1;

        renderizarPilulasTamanho();

        if (tipo === 'comprar') {
            document.getElementById('modal-titulo-acao').innerText = 'Selecionar Opções';
            btnProsseguir1.innerHTML = 'Prosseguir <i class="ph ph-arrow-right"></i>';
        } else {
            document.getElementById('modal-titulo-acao').innerText = 'Adicionar à Sacola';
            btnProsseguir1.innerHTML = '<i class="ph ph-shopping-cart-plus"></i> Confirmar e Adicionar';
        }

        modalSelecao.classList.remove('escondido');
    };

    function renderizarPilulasTamanho() {
        const boxTamanhos = document.getElementById('modal-opcoes-tamanho');
        if (!boxTamanhos) return;
        boxTamanhos.innerHTML = '';

        const qtdTotalDesejada = parseInt(inputQtd.value) || 1;
        let somaSelecionada = 0;
        Object.values(distribuicaoTamanhos).forEach(v => somaSelecionada += v);

        if (indicadorProgresso) {
            if (qtdTotalDesejada > 1) {
                indicadorProgresso.innerText = `(${somaSelecionada} de ${qtdTotalDesejada} selecionados)`;
                indicadorProgresso.style.color = (somaSelecionada === qtdTotalDesejada) ? '#25D366' : '#8D72A3';
            } else {
                indicadorProgresso.innerText = '';
            }
        }

        if (btnProsseguir1) {
            if (somaSelecionada === qtdTotalDesejada) {
                btnProsseguir1.classList.remove('btn-bloqueado');
            } else {
                btnProsseguir1.classList.add('btn-bloqueado');
            }
        }

        pecaAtual.arrayTamanhos.forEach(tamRaw => {
            const tam = tamRaw.trim();
            const qtdDesteTam = distribuicaoTamanhos[tam] || 0;
            const estaSelecionado = qtdDesteTam > 0;

            const pilula = document.createElement('div');
            pilula.className = `tamanho-pula ${estaSelecionado ? 'selecionado' : ''}`;
            pilula.style.cursor = 'pointer';
            
            pilula.innerHTML = `
                ${tam}
                ${qtdDesteTam > 0 ? `<span class="badge-qtd-tamanho">${qtdDesteTam}</span>` : ''}
            `;

            pilula.onclick = () => {
                if (qtdTotalDesejada === 1) {
                    distribuicaoTamanhos = {};
                    distribuicaoTamanhos[tam] = 1;
                } else {
                    if (somaSelecionada < qtdTotalDesejada) {
                        distribuicaoTamanhos[tam] = (distribuicaoTamanhos[tam] || 0) + 1;
                    } else if (distribuicaoTamanhos[tam] > 0) {
                        distribuicaoTamanhos[tam]--;
                        if (distribuicaoTamanhos[tam] === 0) delete distribuicaoTamanhos[tam];
                    }
                }
                renderizarPilulasTamanho();
            };

            boxTamanhos.appendChild(pilula);
        });
    }

    document.getElementById('btn-menos-qtd')?.addEventListener('click', () => {
        let qtd = parseInt(inputQtd.value) || 1;
        if (qtd > 1) {
            inputQtd.value = qtd - 1;
            distribuicaoTamanhos = {};
            distribuicaoTamanhos[pecaAtual.arrayTamanhos[0].trim()] = 1;
            renderizarPilulasTamanho();
        }
    });

    document.getElementById('btn-mais-qtd')?.addEventListener('click', () => {
        let qtd = parseInt(inputQtd.value) || 1;
        if (qtd < 20) {
            inputQtd.value = qtd + 1;
            renderizarPilulasTamanho();
        }
    });

    document.getElementById('btn-fechar-modal-selecao')?.addEventListener('click', () => {
        modalSelecao.classList.add('escondido');
    });

    btnProsseguir1?.addEventListener('click', () => {
        const qtdTotalDesejada = parseInt(inputQtd.value) || 1;
        let somaSelecionada = 0;
        Object.values(distribuicaoTamanhos).forEach(v => somaSelecionada += v);

        if (somaSelecionada < qtdTotalDesejada) {
            mostrarAvisoGeral(
                'Tamanhos Incompletos', 
                `Por favor, selecione os tamanhos para todas as ${qtdTotalDesejada} unidades antes de prosseguir!`,
                '#6B5B7B', 
                'ph-warning-circle'
            );
            return;
        }

        const resumoTamanhosTexto = Object.entries(distribuicaoTamanhos)
            .map(([tam, q]) => (q > 1 ? `${q}x ${tam}` : `${tam}`))
            .join(', ');

if (modoAtual === 'carrinho') {
            let carrinho = JSON.parse(localStorage.getItem('floreBoutiqueCart')) || [];
            
            let itemExistente = carrinho.find(item => item.nome === pecaAtual.nome);
            
            if (itemExistente) {
                if (!itemExistente.distribuicaoTamanhos) itemExistente.distribuicaoTamanhos = {};
                
                Object.entries(distribuicaoTamanhos).forEach(([tam, q]) => {
                    if (q > 0) {
                        itemExistente.distribuicaoTamanhos[tam] = (itemExistente.distribuicaoTamanhos[tam] || 0) + q;
                    }
                });
                itemExistente.quantidadeTotal = Object.values(itemExistente.distribuicaoTamanhos).reduce((a, b) => a + b, 0);
                
                itemExistente.tamanhosDisponiveis = pecaAtual.arrayTamanhos; 
            } else {
                const totalQtd = Object.values(distribuicaoTamanhos).reduce((a, b) => a + b, 0);
                carrinho.push({
                    nome: pecaAtual.nome,
                    imagemUrl: pecaAtual.imagemUrl,
                    distribuicaoTamanhos: { ...distribuicaoTamanhos },
                    quantidadeTotal: totalQtd,
                    precoOriginal: pecaAtual.preco,
                    precoLimpo: parseFloat(pecaAtual.preco.replace('.', '').replace(',', '.')),
                    numZap: pecaAtual.numZap,
                    tamanhosDisponiveis: pecaAtual.arrayTamanhos 
                });
            }

            localStorage.setItem('floreBoutiqueCart', JSON.stringify(carrinho));

            animarVoarParaSacola(btnProsseguir1, pecaAtual.imagemUrl, qtdTotalDesejada);
            modalSelecao.classList.add('escondido');
        }
        else if (modoAtual === 'comprar') {
            const precoLimpo = parseFloat(pecaAtual.preco.replace('.', '').replace(',', '.'));
            const precoTotal = (precoLimpo * qtdTotalDesejada).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

            document.getElementById('resumo-passo2-img').src = pecaAtual.imagemUrl;
            document.getElementById('resumo-passo2-nome').innerText = pecaAtual.nome;
            document.getElementById('resumo-passo2-tam').innerText = resumoTamanhosTexto;
            document.getElementById('resumo-passo2-qtd').innerText = qtdTotalDesejada;
            document.getElementById('resumo-passo2-preco').innerText = `R$ ${precoTotal}`;

            document.getElementById('modal-titulo-acao').innerText = 'Finalizar Pedido';
            
            passo1.classList.add('escondido');
            headerPasso1.classList.add('escondido');
            passo2.classList.remove('escondido');
        }
    });

    btnVoltar1?.addEventListener('click', () => {
        document.getElementById('modal-titulo-acao').innerText = 'Selecionar Opções';
        passo2.classList.add('escondido');
        headerPasso1.classList.remove('escondido');
        passo1.classList.remove('escondido');
    });

    document.getElementById('form-selecao-opcoes')?.addEventListener('submit', function(e) {
        e.preventDefault();

        if (modoAtual === 'comprar') {
            const nomeCliente = inputNome.value.trim();
            const formaPagamento = selectPagamento ? selectPagamento.value : 'Não informado';
            const qtdTotalDesejada = parseInt(inputQtd.value) || 1;

            if (!nomeCliente) {
                mostrarAvisoGeral(
                    'Falta pouco!', 
                    'Por favor, digite seu nome para prosseguirmos com o atendimento.',
                    '#6B5B7B', 
                    'ph-user'
                );
                return;
            }

            const resumoTamanhosTexto = Object.entries(distribuicaoTamanhos)
                .map(([tam, q]) => (q > 1 ? `${q}x ${tam}` : `${tam}`))
                .join(', ');

            const precoLimpo = parseFloat(pecaAtual.preco.replace('.', '').replace(',', '.'));
            const precoTotal = (precoLimpo * qtdTotalDesejada).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

            const mensagemZap = encodeURIComponent(
                `Olá!\nMeu nome é *${nomeCliente}*.\n\n` +
                `Gostaria de finalizar o pedido abaixo:\n` +
                `👗 *Peça:* ${pecaAtual.nome}\n` +
                `📐 *Tamanhos Escolhidos:* ${resumoTamanhosTexto}\n` +
                `🔢 *Quantidade Total:* ${qtdTotalDesejada}\n` +
                `💰 *Valor Total:* R$ ${precoTotal}\n` +
                `💳 *Pagamento:* ${formaPagamento}\n\n` +
                `🖼️ *Foto da peça:* ${pecaAtual.imagemUrl}\n\n` +
                `Como podemos prosseguir com o pagamento e envio?`
            );
            const linkZap = `https://wa.me/${pecaAtual.numZap}?text=${mensagemZap}`;
            window.open(linkZap, '_blank');
            modalSelecao.classList.add('escondido');
        }
    });

    carregarProdutosDoServidor();
    carregarDestaquesHero();
});

// ================= FUNÇÃO DE ANIMAÇÃO FLY-TO-CART =================
function animarVoarParaSacola(elementoOrigem, imagemUrl, quantidadeAdicionada) {
    const sacolaBtn = document.querySelector('.cart-btn');
    if (!sacolaBtn || !elementoOrigem) return;

    const rectOrigem = elementoOrigem.getBoundingClientRect();
    const rectSacola = sacolaBtn.getBoundingClientRect();

    const voador = document.createElement('img');
    voador.src = imagemUrl;
    voador.className = 'flying-item';
    voador.style.left = `${rectOrigem.left + rectOrigem.width / 2 - 25}px`;
    voador.style.top = `${rectOrigem.top + rectOrigem.height / 2 - 32}px`;

    document.body.appendChild(voador);

    requestAnimationFrame(() => {
        voador.style.left = `${rectSacola.left + rectSacola.width / 2 - 12}px`;
        voador.style.top = `${rectSacola.top + rectSacola.height / 2 - 12}px`;
        voador.style.width = '24px';
        voador.style.height = '24px';
        voador.style.opacity = '0.3';
        voador.style.transform = 'scale(0.2) rotate(360deg)';
    });

    setTimeout(() => {
        voador.remove();
        sacolaBtn.classList.add('sacola-bounce');
        setTimeout(() => sacolaBtn.classList.remove('sacola-bounce'), 450);
        if (window.atualizarBadgeNavegacao) {
            window.atualizarBadgeNavegacao();
        }
    }, 800);
}


// ================= MEMÓRIA DA SACOLA (GLOBAL) =================
window.atualizarBadgeNavegacao = function() {
    let carrinho = JSON.parse(localStorage.getItem('floreBoutiqueCart')) || [];
    let totalItens = 0;
    
    carrinho.forEach(item => {
        let dist = item.distribuicaoTamanhos;
        if (dist) {
            totalItens += Object.values(dist).reduce((a, b) => a + b, 0);
        } else {
            totalItens += (item.quantidadeTotal || item.quantidade || 1);
        }
    });

    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        if (totalItens > 0) {
            badge.innerText = totalItens;
            badge.classList.remove('escondido');
            badge.style.display = 'flex';
        } else {
            badge.classList.add('escondido');
            badge.style.display = 'none';
        }
    });
};

document.addEventListener('DOMContentLoaded', window.atualizarBadgeNavegacao);
window.addEventListener('pageshow', window.atualizarBadgeNavegacao);


// ================= LUPA FLUTUANTE DE PESQUISA =================
document.addEventListener('DOMContentLoaded', () => {
    const btnFlutuanteBusca = document.getElementById('btn-flutuante-busca');
    const secaoCatalogo = document.querySelector('.collections-section');
    const caixaPesquisa = document.querySelector('.search-box'); 

    if (btnFlutuanteBusca && secaoCatalogo && caixaPesquisa) {
        window.addEventListener('scroll', () => {
            const inputRect = caixaPesquisa.getBoundingClientRect();
            const catalogoRect = secaoCatalogo.getBoundingClientRect();
            
            if (inputRect.top < 120 && catalogoRect.bottom > 200) {
                if (!btnFlutuanteBusca.classList.contains('visivel')) {
                    btnFlutuanteBusca.classList.remove('escondido-animado');
                    btnFlutuanteBusca.classList.add('visivel');
                }
            } else {
                if (btnFlutuanteBusca.classList.contains('visivel')) {
                    btnFlutuanteBusca.classList.remove('visivel');
                    btnFlutuanteBusca.classList.add('escondido-animado');
                }
            }
        });

        btnFlutuanteBusca.addEventListener('click', () => {
            const offsetAltura = 150; 
            const posicaoElemento = caixaPesquisa.getBoundingClientRect().top + window.scrollY;
            
            window.scrollTo({
                top: posicaoElemento - offsetAltura,
                behavior: 'smooth'
            });

            setTimeout(() => {
                const inputReal = caixaPesquisa.querySelector('input');
                if(inputReal) inputReal.focus();
            }, 500);
        });
    }
});

// ================= ANIMAÇÕES DE SCROLL E HOVER MOBILE =================
window.iniciarAnimacoesScroll = function() {
    const seletores = [
        '.sub-title', '.main-title', '.desc-text', '.info-block', 
        '.social-proof', '.hero .product-card', '.category-carousel-block', 
        '.about-image-card', '.about-tag', '.about-description', '.btn-insta-vazado',
        '.cta-tag', '.cta-desc', '.btn-cta-whatsapp'
    ];
    
    const elementosRevelar = document.querySelectorAll(seletores.join(', '));
    elementosRevelar.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); 
            }
        });
    }, { 
        threshold: 0.1, 
        rootMargin: "0px 0px -40px 0px" 
    });

    elementosRevelar.forEach(el => revealObserver.observe(el));
};

window.iniciarHoverMobileCards = function() {
    const cards = document.querySelectorAll('.catalog-card');
    
    const cardMobileObserver = new IntersectionObserver((entries) => {
        if (window.innerWidth <= 900) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('mobile-focus');
                } else {
                    entry.target.classList.remove('mobile-focus');
                }
            });
        }
    }, { threshold: 0.6, rootMargin: "-15% 0px -15% 0px" });

    cards.forEach(card => cardMobileObserver.observe(card));
};

document.addEventListener('DOMContentLoaded', iniciarAnimacoesScroll);

// ================= SISTEMA DE AVISOS ELEGANTES (GLOBAL) =================
window.mostrarAvisoGeral = function(titulo, texto, corHex, iconeClass) {
    const tituloEl = document.getElementById('titulo-aviso-geral');
    const textoEl = document.getElementById('texto-aviso-geral');
    const divIcone = document.getElementById('cor-icone-aviso');
    const iconeElemento = document.getElementById('icone-aviso-geral');
    const modal = document.getElementById('modal-aviso-geral');

    if(tituloEl && textoEl && divIcone && iconeElemento && modal) {
        tituloEl.innerText = titulo;
        textoEl.innerText = texto;
        divIcone.style.color = corHex;
        iconeElemento.className = `ph-fill ${iconeClass}`;
        modal.classList.remove('escondido');
    }
};

document.getElementById('btn-fechar-aviso-geral')?.addEventListener('click', () => {
    document.getElementById('modal-aviso-geral')?.classList.add('escondido');
});

// ================= SISTEMA DE ZOOM DE IMAGEM SIMPLES =================
window.abrirZoom = function(imagemUrl) {
    const modalZoom = document.getElementById('modal-zoom-imagem');
    const imgAlvo = document.getElementById('img-zoom-alvo');

    if(modalZoom && imgAlvo) {
        imgAlvo.src = imagemUrl;
        modalZoom.classList.remove('escondido');
        // Pequeno delay para garantir que a animação CSS aconteça
        setTimeout(() => {
            modalZoom.classList.add('ativo');
        }, 10);
    }
};

function fecharZoom() {
    const modalZoom = document.getElementById('modal-zoom-imagem');
    const imgAlvo = document.getElementById('img-zoom-alvo');
    
    if (modalZoom) {
        modalZoom.classList.remove('ativo');
        setTimeout(() => {
            modalZoom.classList.add('escondido');
            if (imgAlvo) imgAlvo.src = ''; 
        }, 400); 
    }
}

document.getElementById('btn-fechar-zoom')?.addEventListener('click', fecharZoom);

// Fechar ao clicar no fundo borrado
document.getElementById('modal-zoom-imagem')?.addEventListener('click', function(e) {
    if (e.target === this) {
        fecharZoom();
    }
});