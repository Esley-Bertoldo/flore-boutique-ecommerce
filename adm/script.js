// =========================================================================
    // 1. CONFIGURAÇÃO DO SUPABASE
    // =========================================================================
    const supabaseUrl = 'https://euulzozlzhudfwehdjkv.supabase.co';
    const supabaseKey = 'sb_publishable_z_eqNXUQMX1fcrjXDFLjYg_6uQ7eYw1'; 
    const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

    // =========================================================================
    // 2. VARIÁVEIS E ELEMENTOS DA TELA
    // =========================================================================
    const EMAIL_AUTORIZADO = "floreboutique00@gmail.com";
    const telaLogin = document.getElementById('tela-login');
    const telaPainel = document.getElementById('tela-painel');
    const gridAdminProdutos = document.getElementById('grid-admin-produtos');
    const gridAdminDestaques = document.getElementById('grid-admin-destaques');
    const badgeTotal = document.getElementById('total-produtos-badge');
    const badgeDestaques = document.getElementById('total-destaques-badge');
    
    const menuItems = document.querySelectorAll('.menu-item');
    const abasConteudo = document.querySelectorAll('.tab-content');
    const tituloPagina = document.getElementById('titulo-pagina');
    const subtituloPagina = document.getElementById('subtitulo-pagina');

    // =========================================================================
    // 3. SISTEMA DE ALERTAS E CONFIRMAÇÕES (MODAIS PROFISSIONAIS)
    // =========================================================================
    function exibirAviso(titulo, mensagem, tipo = 'sucesso') {
        const modal = document.getElementById('modal-alerta');
        document.getElementById('alerta-titulo').innerText = titulo;
        document.getElementById('alerta-mensagem').innerHTML = mensagem;
        
        document.getElementById('btn-alerta-cancelar').classList.add('escondido');
        const icone = document.getElementById('alerta-icone');
        const btnConfirmar = document.getElementById('btn-alerta-confirmar');
        
        if (tipo === 'erro') {
            icone.innerHTML = '<i class="ph ph-warning-circle" style="color: var(--danger);"></i>';
            btnConfirmar.style.backgroundColor = 'var(--danger)';
        } else {
            icone.innerHTML = '<i class="ph ph-check-circle" style="color: #4CAF50;"></i>';
            btnConfirmar.style.backgroundColor = 'var(--purple-dark)';
        }

        btnConfirmar.onclick = () => modal.classList.add('escondido');
        modal.classList.remove('escondido');
    }

    function exibirConfirmacao(titulo, mensagem, callbackCallback) {
        const modal = document.getElementById('modal-alerta');
        document.getElementById('alerta-titulo').innerText = titulo;
        document.getElementById('alerta-mensagem').innerHTML = mensagem;
        
        document.getElementById('btn-alerta-cancelar').classList.remove('escondido');
        document.getElementById('alerta-icone').innerHTML = '<i class="ph ph-question" style="color: var(--purple-dark);"></i>';

        const btnConfirmar = document.getElementById('btn-alerta-confirmar');
        btnConfirmar.style.backgroundColor = 'var(--danger)';
        btnConfirmar.innerText = 'Sim, continuar';

        document.getElementById('btn-alerta-cancelar').onclick = () => modal.classList.add('escondido');
        
        btnConfirmar.onclick = () => {
            modal.classList.add('escondido');
            callbackCallback();
        };
        
        modal.classList.remove('escondido');
    }

    // =========================================================================
    // 4. MONITOR DE SEGURANÇA E LOGIN PRIVADO
    // =========================================================================
    async function verificarSessao() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session && session.user.email === EMAIL_AUTORIZADO) {
            telaLogin.classList.add('escondido');
            telaPainel.classList.remove('escondido');
            carregarProdutosAdmin(); 
            carregarDestaquesAdmin();
        } else {
            telaLogin.classList.remove('escondido');
            telaPainel.classList.add('escondido');
        }
    }
    verificarSessao();

    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const btn = document.getElementById('btn-entrar');
            const senha = document.getElementById('login-senha').value;
            
            btn.innerText = "Verificando...";
            btn.disabled = true;

            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: EMAIL_AUTORIZADO,
                    password: senha
                });

                if (error) {
                    exibirAviso("Acesso Negado", "Senha incorreta ou acesso não autorizado.", "erro");
                    btn.innerHTML = '<i class="ph ph-sign-in"></i> Acessar Painel';
                    btn.disabled = false;
                } else {
                    window.location.reload(); 
                }
            } catch (err) {
                exibirAviso("Erro de Conexão", "Não foi possível ligar ao servidor da nuvem.", "erro");
                btn.innerHTML = '<i class="ph ph-sign-in"></i> Acessar Painel';
                btn.disabled = false;
            }
        });
    }

    document.getElementById('btn-logout')?.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.reload();
    });

// =========================================================================
    // 5. FUNÇÃO MÁGICA: UPLOAD DE FOTOS PARA A NUVEM
    // =========================================================================
    async function uploadFoto(arquivoImagem) {
        const nomeArquivo = `${Date.now()}_${arquivoImagem.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        
        const { data, error } = await supabaseClient.storage
            .from('flore-boutique-fotos')
            .upload(nomeArquivo, arquivoImagem);

        if (error) throw new Error("Falha no upload da imagem: " + error.message);

        const { data: urlData } = supabaseClient.storage.from('flore-boutique-fotos').getPublicUrl(nomeArquivo);
        return urlData.publicUrl;
    }

    // =========================================================================
    // 6. NAVEGAÇÃO ENTRE AS ABAS
    // =========================================================================
   const chipPerfil = document.getElementById('chip-perfil');
    const chipMiniDash = document.getElementById('chip-mini-dash');

    menuItems.forEach(botao => {
        botao.addEventListener('click', () => {
            menuItems.forEach(item => item.classList.remove('ativo'));
            abasConteudo.forEach(aba => aba.classList.remove('ativo'));

            botao.classList.add('ativo');
            const idAba = botao.getAttribute('data-aba');
            document.getElementById(idAba).classList.add('ativo');

            if (idAba === 'aba-vendas') {
                tituloPagina.innerText = "Vendas e Caixa";
                subtituloPagina.innerText = "Registre as peças vendidas.";
                chipPerfil?.classList.add('escondido');
                chipMiniDash?.classList.remove('escondido');
                carregarListaProdutosParaPesquisa(); 
            } else {
                chipPerfil?.classList.remove('escondido');
                chipMiniDash?.classList.add('escondido');
                
                if (idAba === 'aba-produtos') {
                    tituloPagina.innerText = "Catálogo Geral";
                    subtituloPagina.innerText = "Gerencie as roupas cadastradas na vitrine online";
                } else if (idAba === 'aba-cadastrar') {
                    tituloPagina.innerText = "Adicionar Peça";
                    subtituloPagina.innerText = "Cadastre novos vestidos, conjuntos, blusas ou biquínis";
                } else if (idAba === 'aba-destaques') {
                    tituloPagina.innerText = "Destaques da Hero";
                    subtituloPagina.innerText = "Gerencie os cards giratórios do topo (Máximo 5 peças permitidas)";
                } else if (idAba === 'aba-perfil') {
                    tituloPagina.innerText = "Perfil Administrativo";
                    subtituloPagina.innerText = "Informações de segurança e status da nuvem";
                } else if (idAba === 'aba-dashboard') {
                    tituloPagina.innerText = "Dashboard Inteligente";
                    subtituloPagina.innerText = "Analise o faturamento, lucro e crescimento da Floré Boutique";
                    carregarInteligenciaDashboard();
                }
            }
        });
    });

    // =========================================================================
    // 7. LISTAGEM DO CATÁLOGO GERAL
    // =========================================================================
    async function carregarProdutosAdmin() {
        if (!gridAdminProdutos) return;
        try {
            const { data: produtos, error } = await supabaseClient
                .from('produtos')
                .select('*')
                .order('dataCadastro', { ascending: false });

            if (error) throw error;

            gridAdminProdutos.innerHTML = '';
            badgeTotal.innerText = produtos.length;

            if (produtos.length === 0) {
                gridAdminProdutos.innerHTML = '<p style="color: #888; grid-column: span 3;">Nenhuma peça cadastrada no catálogo ainda.</p>';
                return;
            }

            produtos.forEach((produto) => {
                let nomeSecao = "Vestidos";
                if (produto.categoria === 'conjuntos') nomeSecao = "Conjuntos";
                if (produto.categoria === 'blusas') nomeSecao = "Blusas";
                if (produto.categoria === 'calcas') nomeSecao = "Calças";
                if (produto.categoria === 'blusas-personalizadas') nomeSecao = "Blusas Personalizadas";
                if (produto.categoria === 'biquinis') nomeSecao = "Biquínis";
                if (produto.categoria === 'plus-size') nomeSecao = "Plus Size";
                if (produto.categoria === 'natal') nomeSecao = "Natal";
                if (produto.categoria === 'ano-novo') nomeSecao = "Ano Novo";

                const tamanhosTexto = (produto.tamanhos || ['M']).join(',');
                const tamanhosExibicao = (produto.tamanhos || ['M']).join(', ');

                const cardHTML = `
                    <div class="admin-card">
                        <div class="admin-card-img">
                            <span class="badge-section">${nomeSecao}</span>
                            <img src="${produto.imagemUrl}" alt="${produto.nome}">
                        </div>
                        <div class="admin-card-body">
                            <h4>${produto.nome}</h4>
                            <span class="admin-card-price">R$ ${produto.preco}</span>
                            <p style="font-size: 0.78rem; color: #666; margin-bottom: 14px;">
                                Tamanhos: <strong style="color: var(--purple-dark);">${tamanhosExibicao}</strong>
                            </p>
                            
                            <div class="admin-card-actions">
                                <button class="btn-action btn-edit" onclick="abrirModalEditar('${produto.id}', '${produto.nome}', '${produto.categoria}', '${produto.precoAntigo || ''}', '${produto.preco}', '${produto.imagemUrl}', '${tamanhosTexto}')">
                                    <i class="ph ph-pencil-simple"></i> Editar
                                </button>
                                <button class="btn-action btn-delete" onclick="removerProduto('${produto.id}', '${produto.nome}')">
                                    <i class="ph ph-trash"></i> Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                gridAdminProdutos.innerHTML += cardHTML;
            });
        } catch (erro) {
            console.error("Erro ao puxar produtos:", erro);
            gridAdminProdutos.innerHTML = '<p style="color: red;">Erro ao carregar o catálogo.</p>';
        }
    }

    function removerProduto(id, nome) {
        exibirConfirmacao(
            "Excluir Peça", 
            `Tem a certeza que deseja remover <strong>"${nome}"</strong> do catálogo? Esta ação não pode ser desfeita e a peça sumirá do site.`, 
            async () => {
                try {
                    const { error } = await supabaseClient.from('produtos').delete().eq('id', id);
                    if (error) throw error;
                    
                    exibirAviso("Sucesso", "A peça foi removida do catálogo com sucesso.");
                    carregarProdutosAdmin();
                } catch (erro) {
                    exibirAviso("Erro na Exclusão", "Não foi possível remover a peça. " + erro.message, "erro");
                }
            }
        );
    }

    // =========================================================================
    // 8. EDITAR PRODUTO DO CATÁLOGO
    // =========================================================================
    const modalEditar = document.getElementById('modal-editar');
    let urlAntigaEdicao = ''; 

    function abrirModalEditar(id, nome, categoria, precoAntigo, preco, imagemUrl, tamanhosStr) {
        document.getElementById('edit-id').value = id;
        document.getElementById('edit-nome').value = nome;
        document.getElementById('edit-categoria').value = categoria;
        document.getElementById('edit-precoAntigo').value = precoAntigo;
        document.getElementById('edit-preco').value = preco;
        
        urlAntigaEdicao = imagemUrl; 
        document.getElementById('edit-imagem').value = ''; 

        document.querySelectorAll('input[name="edit-tamanho"]').forEach(chk => chk.checked = false);
        
        if (tamanhosStr) {
            const listaTamanhos = tamanhosStr.split(',');
            listaTamanhos.forEach(tam => {
                const checkbox = document.querySelector(`input[name="edit-tamanho"][value="${tam}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        modalEditar.classList.remove('escondido');
    }

    document.getElementById('btn-fechar-modal').addEventListener('click', () => {
        modalEditar.classList.add('escondido');
    });

    document.getElementById('form-editar').addEventListener('submit', async function(e) {
        e.preventDefault();
        const botao = document.getElementById('form-editar').querySelector('button[type="submit"]');
        botao.innerText = "A guardar...";
        botao.disabled = true;

        try {
            const id = document.getElementById('edit-id').value;
            const tamanhosEditados = Array.from(document.querySelectorAll('input[name="edit-tamanho"]:checked')).map(el => el.value);
            
            let urlFinal = urlAntigaEdicao;
            const arquivoFotoNova = arquivoFinalEdicao || document.getElementById('edit-imagem').files[0];
            
            if (arquivoFotoNova) {
                urlFinal = await uploadFoto(arquivoFotoNova);
            }

            const dadosAtualizados = {
                nome: document.getElementById('edit-nome').value.trim(),
                categoria: document.getElementById('edit-categoria').value,
                precoAntigo: document.getElementById('edit-precoAntigo').value.trim(),
                preco: document.getElementById('edit-preco').value.trim(),
                imagemUrl: urlFinal,
                tamanhos: tamanhosEditados.length > 0 ? tamanhosEditados : ['M']
            };

            const { error } = await supabaseClient.from('produtos').update(dadosAtualizados).eq('id', id);
            if (error) throw error;

            modalEditar.classList.add('escondido');
            exibirAviso("Atualizado!", "As alterações desta peça foram guardadas com sucesso.");
            carregarProdutosAdmin(); 
        } catch (erro) {
            exibirAviso("Erro ao Atualizar", erro.message, "erro");
        } finally {
            botao.innerText = "Salvar Alterações";
            botao.disabled = false;
        }
    });

    // =========================================================================
    // 9. CADASTRAR NOVA PEÇA NO CATÁLOGO
    // =========================================================================
    document.getElementById('form-produto').addEventListener('submit', async function(e) {
        e.preventDefault();
        const botao = document.querySelector('.btn-salvar');
        botao.innerText = "A carregar foto e guardar...";
        botao.disabled = true;

        try {
            const arquivoFoto = arquivoFinalCadastro || document.getElementById('imagem').files[0];
            if (!arquivoFoto) {
                exibirAviso("Foto em falta", "Por favor, selecione uma imagem da galeria para esta peça.", "erro");
                botao.innerHTML = '<i class="ph ph-check-circle"></i> Publicar na Vitrine';
                botao.disabled = false;
                return;
            }

            const urlFotoSalva = await uploadFoto(arquivoFoto);
            const tamanhosSelecionados = Array.from(document.querySelectorAll('input[name="tamanho"]:checked')).map(el => el.value);

            const dadosProduto = {
                nome: document.getElementById('nome').value.trim(),
                categoria: document.getElementById('categoria').value,
                precoAntigo: document.getElementById('precoAntigo').value.trim(),
                preco: document.getElementById('preco').value.trim(),
                imagemUrl: urlFotoSalva,
                tamanhos: tamanhosSelecionados.length > 0 ? tamanhosSelecionados : ['M']
            };

            const { error } = await supabaseClient.from('produtos').insert([dadosProduto]);
            if (error) throw error;

            document.getElementById('form-produto').reset();
            document.querySelector('[data-aba="aba-produtos"]').click();
            
            exibirAviso("Sucesso!", "Nova peça publicada na vitrine online.");
            carregarProdutosAdmin();
        } catch (erro) {
            exibirAviso("Erro ao Guardar", erro.message, "erro");
        } finally {
            botao.innerHTML = '<i class="ph ph-check-circle"></i> Publicar na Vitrine';
            botao.disabled = false;
        }
    });

    // =========================================================================
    // 10. GESTÃO DE DESTAQUES HERO
    // =========================================================================
    let totalDestaquesAtuais = 0;

    async function carregarDestaquesAdmin() {
        if (!gridAdminDestaques) return;
        try {
            const { data: destaques, error } = await supabaseClient
                .from('destaques')
                .select('*')
                .order('dataCadastro', { ascending: false });

            if (error) throw error;

            gridAdminDestaques.innerHTML = '';
            totalDestaquesAtuais = destaques.length;
            badgeDestaques.innerText = totalDestaquesAtuais;

            const btnSalvarDestaque = document.getElementById('btn-salvar-destaque');
            
            if (totalDestaquesAtuais >= 5) {
                btnSalvarDestaque.disabled = true;
                btnSalvarDestaque.innerHTML = '<i class="ph ph-lock"></i> Limite Máximo de 5 Atingido';
            } else {
                btnSalvarDestaque.disabled = false;
                btnSalvarDestaque.innerHTML = '<i class="ph ph-star"></i> Adicionar aos Destaques';
            }

            if (destaques.length === 0) {
                gridAdminDestaques.innerHTML = '<p style="color: #888; grid-column: span 3;">Nenhum destaque cadastrado na Hero.</p>';
                return;
            }

            destaques.forEach((dest) => {
                const cardHTML = `
                    <div class="admin-card">
                        <div class="admin-card-img">
                            <span class="badge-section" style="background: #D81B60;">Hero Top</span>
                            <img src="${dest.imagemUrl}" alt="${dest.titulo}">
                        </div>
                        <div class="admin-card-body">
                            <h4>${dest.titulo}</h4>
                            <span class="admin-card-price">R$ ${dest.preco}</span>
                            <p style="font-size:0.8rem; color:#666; margin-bottom:15px;">${dest.descricao}</p>
                            <div class="admin-card-actions">
                                <button class="btn-action btn-delete" onclick="removerDestaque('${dest.id}', '${dest.titulo}')" style="width:100%;">
                                    <i class="ph ph-trash"></i> Excluir Destaque
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                gridAdminDestaques.innerHTML += cardHTML;
            });
        } catch (erro) {
            console.error("Erro ao puxar destaques:", erro);
        }
    }

    function removerDestaque(id, titulo) {
        exibirConfirmacao(
            "Remover Destaque", 
            `Deseja tirar <strong>"${titulo}"</strong> do carrossel principal?`, 
            async () => {
                try {
                    const { error } = await supabaseClient.from('destaques').delete().eq('id', id);
                    if (error) throw error;

                    exibirAviso("Sucesso", "Destaque removido da página principal.");
                    carregarDestaquesAdmin();
                } catch (erro) {
                    exibirAviso("Erro ao excluir", erro.message, "erro");
                }
            }
        );
    }

    document.getElementById('form-destaque').addEventListener('submit', async function(e) {
        e.preventDefault();

        if (totalDestaquesAtuais >= 5) {
            exibirAviso("Limite Atingido", "Apague um destaque antigo primeiro antes de adicionar um novo.", "erro");
            return;
        }

        const botao = document.getElementById('btn-salvar-destaque');
        botao.innerText = "A carregar...";
        botao.disabled = true;

        try {
            const arquivoFoto = document.getElementById('destaque-imagem').files[0];
            if (!arquivoFoto) {
                exibirAviso("Foto em falta", "Selecione uma imagem para o destaque.", "erro");
                botao.disabled = false;
                botao.innerHTML = '<i class="ph ph-star"></i> Adicionar aos Destaques';
                return;
            }

            const urlFotoSalva = await uploadFoto(arquivoFoto);

            const novoDestaque = {
                titulo: document.getElementById('destaque-titulo').value.trim(),
                preco: document.getElementById('destaque-preco').value.trim(),
                descricao: document.getElementById('destaque-desc').value.trim(),
                imagemUrl: urlFotoSalva
            };

            const { error } = await supabaseClient.from('destaques').insert([novoDestaque]);
            if (error) throw error;

            document.getElementById('form-destaque').reset();
            exibirAviso("Destaque Publicado!", "A sua peça agora aparece no topo do site.");
            carregarDestaquesAdmin();
        } catch (erro) {
            exibirAviso("Erro ao Guardar", erro.message, "erro");
        } finally {
            botao.disabled = false;
            botao.innerHTML = '<i class="ph ph-star"></i> Adicionar aos Destaques';
            carregarDestaquesAdmin();
        }
    });

    // =========================================================================
    // 11. SISTEMA DE BUSCA E FILTRO NO PAINEL
    // =========================================================================
    const inputBuscaAdmin = document.getElementById('buscar-produto');
    const selectFiltroAdmin = document.getElementById('filtrar-categoria');

    function aplicarFiltrosAdmin() {
        const termo = inputBuscaAdmin ? inputBuscaAdmin.value.toLowerCase() : '';
        const categoriaEscolhida = selectFiltroAdmin ? selectFiltroAdmin.value.toLowerCase() : 'todos';
        const cards = document.querySelectorAll('#grid-admin-produtos .admin-card');

        cards.forEach(card => {
            const nome = card.querySelector('h4').innerText.toLowerCase();
            const textoBadge = card.querySelector('.badge-section').innerText.toLowerCase(); 
            
          let categoriaMatch = false;
        if (categoriaEscolhida === 'todos') {
            categoriaMatch = true;
        } else if (categoriaEscolhida === 'biquinis' && textoBadge.includes('biquíni')) {
            categoriaMatch = true; 
        } else if (categoriaEscolhida === 'plus-size' && textoBadge.includes('plus size')) {
            categoriaMatch = true;
        } else if (categoriaEscolhida === 'calcas' && textoBadge.includes('calça')) {
            categoriaMatch = true; 
        } else if (categoriaEscolhida === 'blusas-personalizadas' && textoBadge.includes('personalizadas')) {
            categoriaMatch = true;
        } else if (categoriaEscolhida === 'natal' && textoBadge.includes('natal')) {
            categoriaMatch = true;
        } else if (categoriaEscolhida === 'ano-novo' && textoBadge.includes('ano novo')) {
            categoriaMatch = true;
        } else if (textoBadge.includes(categoriaEscolhida)) {
            categoriaMatch = true;
        }

            const buscaMatch = nome.includes(termo);

            if (buscaMatch && categoriaMatch) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    inputBuscaAdmin?.addEventListener('input', aplicarFiltrosAdmin);
    selectFiltroAdmin?.addEventListener('change', aplicarFiltrosAdmin);

    // =========================================================================
// 12. CONTROLE DO MENU MOBILE (SIDEBAR DESLIZANTE)
// =========================================================================
const btnMenuMobile = document.getElementById('btn-menu-mobile');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function alternarMenuMobile() {
    sidebar.classList.toggle('aberta');
    sidebarOverlay.classList.toggle('ativo');
}

// Abre o menu ao clicar no botão
if (btnMenuMobile) {
    btnMenuMobile.addEventListener('click', alternarMenuMobile);
}

// Fecha o menu ao clicar na parte escura (fora do menu)
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', alternarMenuMobile);
}

// Fecha o menu automaticamente após escolher uma aba no telemóvel
const itensMenuSidebar = document.querySelectorAll('.sidebar-menu .menu-item');
itensMenuSidebar.forEach(botao => {
    botao.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
            sidebar.classList.remove('aberta');
            sidebarOverlay.classList.remove('ativo');
        }
    });
});

// ================= MOSTRAR / OCULTAR SENHA =================
    const toggleSenhaBtn = document.getElementById('toggle-senha');
    const inputSenha = document.getElementById('login-senha');

    if (toggleSenhaBtn && inputSenha) {
        toggleSenhaBtn.addEventListener('click', () => {
            if (inputSenha.type === 'password') {
                inputSenha.type = 'text';
                toggleSenhaBtn.classList.remove('ph-eye');
                toggleSenhaBtn.classList.add('ph-eye-slash'); 
            } else {
                inputSenha.type = 'password';
                toggleSenhaBtn.classList.remove('ph-eye-slash');
                toggleSenhaBtn.classList.add('ph-eye'); 
            }
        });
    }

    // =========================================================================
    // 13. SISTEMA DE CORTE DE IMAGEM COM CROPPER.JS
    // =========================================================================
    let cropperInstance = null;
    let blobImagemCortada = null;
    let callbackFotoPronta = null;

    const modalCortador = document.getElementById('modal-cortador');
    const imagemParaCortar = document.getElementById('imagem-para-cortar');
    const btnConfirmarCorte = document.getElementById('btn-confirmar-corte');
    const btnCancelarCorte = document.getElementById('btn-cancelar-corte');
    const btnFecharCortador = document.getElementById('btn-fechar-cortador');

    function iniciarProcessoDeCorte(inputElement, callback) {
        const arquivo = inputElement.files[0];
        if (!arquivo) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            imagemParaCortar.src = e.target.result;
            modalCortador.classList.remove('escondido');
            callbackFotoPronta = callback;

            if (cropperInstance) {
                cropperInstance.destroy();
            }

            cropperInstance = new Cropper(imagemParaCortar, {
                aspectRatio: NaN, 
                viewMode: 1,
                autoCropArea: 1,
                responsive: true,
                autoCrop: true,
            });
        };
        reader.readAsDataURL(arquivo);
    }

    btnConfirmarCorte?.addEventListener('click', () => {
        if (!cropperInstance) return;

        cropperInstance.crop();
        cropperInstance.getCroppedCanvas({
            width: 800,   
            height: 1000, 
            imageSmoothingQuality: 'high'
        }).toBlob((blob) => {
            blobImagemCortada = new File([blob], `cortada_${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            modalCortador.classList.add('escondido');
            if (cropperInstance) {
                cropperInstance.destroy();
                cropperInstance = null;
            }

            if (callbackFotoPronta) callbackFotoPronta(blobImagemCortada);
        }, 'image/jpeg', 0.9);
    });

    function fecharCortador() {
        modalCortador.classList.add('escondido');
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        blobImagemCortada = null;
    }

    btnCancelarCorte?.addEventListener('click', fecharCortador);
    btnFecharCortador?.addEventListener('click', fecharCortador);

    let arquivoFinalCadastro = null;
    let arquivoFinalEdicao = null;

    document.getElementById('imagem')?.addEventListener('change', function(e) {
        iniciarProcessoDeCorte(this, (blobCortado) => {
            arquivoFinalCadastro = blobCortado;
        });
    });

    document.getElementById('edit-imagem')?.addEventListener('change', function(e) {
        iniciarProcessoDeCorte(this, (blobCortado) => {
            arquivoFinalEdicao = blobCortado;
        });
    });

    // =========================================================================
    // 14. SISTEMA INTELIGENTE DE VENDAS E DASHBOARD (COM EDIÇÃO E EXCLUSÃO)
    // =========================================================================

    const inputDataVenda = document.getElementById('venda-data');
    if (inputDataVenda) {
        inputDataVenda.value = new Date().toISOString().split('T')[0];
    }

    document.getElementById('link-ver-dashboard')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('[data-aba="aba-dashboard"]').click();
    });

    let produtosParaVenda = [];
    const inputPesquisaProduto = document.getElementById('venda-pesquisa-produto');
    const inputProdutoSelecionado = document.getElementById('venda-produto-selecionado');
    const dropdownProdutos = document.getElementById('dropdown-produtos');

    async function carregarListaProdutosParaPesquisa() {
        try {
            const { data, error } = await supabaseClient.from('produtos').select('id, nome, preco, imagemUrl').order('nome');
            if (error) throw error;
            produtosParaVenda = data;
        } catch (erro) {
            console.error("Erro ao puxar roupas para pesquisa:", erro);
        }
    }

    inputPesquisaProduto?.addEventListener('input', function() {
        const termo = this.value.toLowerCase().trim();
        dropdownProdutos.innerHTML = '';
        
        if (termo.length === 0) {
            dropdownProdutos.classList.add('escondido');
            return;
        }

        const resultados = produtosParaVenda.filter(p => p.nome.toLowerCase().includes(termo));
        
        if (resultados.length === 0) {
            dropdownProdutos.innerHTML = '<div style="padding: 15px; text-align: center; color: #888; font-size: 0.9rem;">Nenhuma peça encontrada.</div>';
        } else {
            resultados.forEach(p => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.innerHTML = `
                    <img src="${p.imagemUrl}" alt="Foto">
                    <div class="dropdown-info">
                        <span class="dropdown-nome">${p.nome}</span>
                        <span class="dropdown-preco">Sugerido: R$ ${p.preco}</span>
                    </div>
                `;
                item.addEventListener('click', () => {
                    inputPesquisaProduto.value = p.nome;
                    inputProdutoSelecionado.value = p.nome;
                    document.getElementById('venda-valor').value = p.preco.replace(',', '.');
                    dropdownProdutos.classList.add('escondido');
                });
                dropdownProdutos.appendChild(item);
            });
        }
        dropdownProdutos.classList.remove('escondido');
    });

    document.addEventListener('click', (e) => {
        if (inputPesquisaProduto && !inputPesquisaProduto.contains(e.target) && !dropdownProdutos.contains(e.target)) {
            dropdownProdutos.classList.add('escondido');
        }
    });

    document.getElementById('form-venda')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nomeDaPeca = document.getElementById('venda-produto-selecionado').value || inputPesquisaProduto.value.trim();
        if (!nomeDaPeca) {
            exibirAviso("Atenção", "Por favor, informe a peça vendida.", "erro");
            return;
        }

        const botao = this.querySelector('button[type="submit"]');
        botao.innerText = "Registrando Venda...";
        botao.disabled = true;

        try {
            let dataEscolhida = document.getElementById('venda-data').value;
            if(!dataEscolhida) dataEscolhida = new Date().toISOString().split('T')[0]; 

            const novaVenda = {
                produto_nome: nomeDaPeca,
                cliente: document.getElementById('venda-cliente').value.trim(),
                metodo_pagamento: document.getElementById('venda-pagamento').value,
                valor_venda: parseFloat(document.getElementById('venda-valor').value),
                valor_custo: parseFloat(document.getElementById('venda-custo').value),
                data_venda: dataEscolhida
            };

            const { error } = await supabaseClient.from('vendas').insert([novaVenda]);
            if (error) throw error;

            exibirAviso("Venda Registrada!", "Parabéns! O valor já foi contabilizado no seu Dashboard.");
            document.getElementById('form-venda').reset();
            inputProdutoSelecionado.value = '';
            inputDataVenda.value = new Date().toISOString().split('T')[0];
            
            carregarInteligenciaDashboard(); 
        } catch (erro) {
            exibirAviso("Erro ao registrar", erro.message, "erro");
        } finally {
            botao.innerHTML = '<i class="ph ph-check-circle"></i> Registrar Venda no Sistema';
            botao.disabled = false;
        }
    });

    let todasAsVendasBD = [];

    const NOMES_MESES = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    function extrairAnoEMes(dataStr) {
        if (!dataStr) return { ano: null, mes: null };
        if (dataStr.includes('T')) {
            const d = new Date(dataStr);
            return { ano: d.getFullYear(), mes: d.getMonth() };
        } else if (dataStr.includes('-')) {
            const partes = dataStr.split('-');
            return { ano: parseInt(partes[0]), mes: parseInt(partes[1]) - 1 };
        }
        const d = new Date(dataStr);
        return { ano: d.getFullYear(), mes: d.getMonth() };
    }

    async function carregarInteligenciaDashboard() {
        try {
            const { data: vendas, error } = await supabaseClient.from('vendas').select('*').order('data_venda', { ascending: false });
            if (error) throw error;

            todasAsVendasBD = vendas;

            let faturamentoGeralTotal = 0;
            todasAsVendasBD.forEach(v => {
                faturamentoGeralTotal += Number(v.valor_venda || 0);
            });
            const miniDashValor = document.getElementById('mini-dash-valor');
            if (miniDashValor) {
                miniDashValor.innerText = `R$ ${faturamentoGeralTotal.toFixed(2).replace('.', ',')}`;
            }

            popularFiltrosDataDinamicos();
            aplicarFiltrosDashboard();
        } catch (erro) {
            console.error("Erro ao carregar Dashboard:", erro);
        }
    }

    function popularFiltrosDataDinamicos() {
        const selectAno = document.getElementById('filtro-ano-dash');
        if (!selectAno) return;

        const anoAtualSelecionado = selectAno.value || 'todos';

        const anosUnicos = new Set();
        todasAsVendasBD.forEach(v => {
            const { ano } = extrairAnoEMes(v.data_venda);
            if (ano && !isNaN(ano)) anosUnicos.add(ano);
        });

        const listaAnos = Array.from(anosUnicos).sort((a, b) => b - a); 

        selectAno.innerHTML = '<option value="todos">Todos os Anos</option>';
        listaAnos.forEach(ano => {
            selectAno.innerHTML += `<option value="${ano}">${ano}</option>`;
        });

        selectAno.value = listaAnos.includes(parseInt(anoAtualSelecionado)) ? anoAtualSelecionado : 'todos';

        atualizarOpcoesMeses();
    }

    function atualizarOpcoesMeses() {
        const selectAno = document.getElementById('filtro-ano-dash');
        const selectMes = document.getElementById('filtro-mes-dash');
        if (!selectMes) return;
        

        const anoEscolhido = selectAno ? selectAno.value : 'todos';
        const mesAtualSelecionado = selectMes.value || 'todos';

        const vendasDoAno = anoEscolhido === 'todos' 
            ? todasAsVendasBD 
            : todasAsVendasBD.filter(v => extrairAnoEMes(v.data_venda).ano == anoEscolhido);

        const mesesUnicos = new Set();
        vendasDoAno.forEach(v => {
            const { mes } = extrairAnoEMes(v.data_venda);
            if (mes !== null && mes !== undefined && !isNaN(mes)) {
                mesesUnicos.add(mes);
            }
        });

        const listaMeses = Array.from(mesesUnicos).sort((a, b) => a - b);

        selectMes.innerHTML = '<option value="todos">Todos os Meses</option>';
        listaMeses.forEach(mesIndex => {
            selectMes.innerHTML += `<option value="${mesIndex}">${NOMES_MESES[mesIndex]}</option>`;
        });

        selectMes.value = listaMeses.includes(parseInt(mesAtualSelecionado)) ? mesAtualSelecionado : 'todos';
    }

    function aplicarFiltrosDashboard() {
        const anoEscolhido = document.getElementById('filtro-ano-dash')?.value || 'todos';
        const mesEscolhido = document.getElementById('filtro-mes-dash')?.value || 'todos';
        const termoBusca = document.getElementById('buscar-historico')?.value.toLowerCase().trim() || '';

        let vendasFiltradas = todasAsVendasBD.filter(v => {
            const { ano, mes } = extrairAnoEMes(v.data_venda);

            if (anoEscolhido !== 'todos' && ano != anoEscolhido) return false;
            if (mesEscolhido !== 'todos' && mes != mesEscolhido) return false;

            return true;
        });

        if (termoBusca) {
            vendasFiltradas = vendasFiltradas.filter(v => 
                (v.cliente && v.cliente.toLowerCase().includes(termoBusca)) || 
                (v.produto_nome && v.produto_nome.toLowerCase().includes(termoBusca))
            );
        }

        let faturamentoBruto = 0;
        let custoTotal = 0;

        vendasFiltradas.forEach(v => {
            faturamentoBruto += Number(v.valor_venda || 0);
            custoTotal += Number(v.valor_custo || 0);
        });

        const lucroLiquido = faturamentoBruto - custoTotal;
        const formatarDinheiro = (valor) => `R$ ${valor.toFixed(2).replace('.', ',')}`;
        
        const dashFat = document.getElementById('dash-faturamento');
        if (dashFat) dashFat.innerText = formatarDinheiro(faturamentoBruto);
        
        const dashLucro = document.getElementById('dash-lucro');
        if (dashLucro) dashLucro.innerText = formatarDinheiro(lucroLiquido);
        
        const dashPecas = document.getElementById('dash-pecas');
        if (dashPecas) dashPecas.innerText = vendasFiltradas.length;

        renderizarCardsHistorico(vendasFiltradas);
    }

    document.getElementById('filtro-ano-dash')?.addEventListener('change', () => {
        atualizarOpcoesMeses();
        aplicarFiltrosDashboard();
    });
    document.getElementById('filtro-mes-dash')?.addEventListener('change', aplicarFiltrosDashboard);
    document.getElementById('buscar-historico')?.addEventListener('input', aplicarFiltrosDashboard);

    function renderizarCardsHistorico(listaVendas) {
        const gridHistorico = document.getElementById('grid-historico-vendas');
        if (!gridHistorico) return;
        gridHistorico.innerHTML = '';

        if (listaVendas.length === 0) {
            gridHistorico.innerHTML = '<p style="color: #888; grid-column: 1 / -1; text-align: center; padding: 20px;">Nenhuma venda encontrada para este filtro.</p>';
            return;
        }

        listaVendas.forEach(venda => {
            const lucroDestaVenda = Number(venda.valor_venda) - Number(venda.valor_custo);
            
            let dataLocal = "";
            if (venda.data_venda.includes('T')) {
                 dataLocal = new Date(venda.data_venda).toLocaleDateString('pt-BR');
            } else if (venda.data_venda.includes('-')) {
                 const partesData = venda.data_venda.split('-');
                 dataLocal = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;
            } else {
                 dataLocal = venda.data_venda;
            }

            const cardHtml = `
                <div class="card-venda-historico">
                    <div class="cv-header">
                        <span class="cv-cliente"><i class="ph ph-user" style="color: var(--text-muted); font-size: 0.9rem;"></i> ${venda.cliente}</span>
                        <span class="cv-data"><i class="ph ph-calendar-blank"></i> ${dataLocal}</span>
                    </div>
                    <div class="cv-produto">
                        <i class="ph ph-hanger" style="color: var(--purple-light);"></i> 
                        <strong>${venda.produto_nome}</strong>
                    </div>
                    <div>
                        <span class="badge-pagamento">${venda.metodo_pagamento}</span>
                    </div>
                    <div class="cv-footer">
                        <div class="cv-lucro">
                            <i class="ph ph-trend-up"></i> Lucro: R$ ${lucroDestaVenda.toFixed(2).replace('.', ',')}
                        </div>
                        <span class="cv-valor">R$ ${Number(venda.valor_venda).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="cv-actions">
                        <button type="button" class="btn-action btn-edit" onclick="abrirModalEditarVenda('${venda.id}')">
                            <i class="ph ph-pencil-simple"></i> Editar
                        </button>
                        <button type="button" class="btn-action btn-delete" onclick="removerVendaDirecta('${venda.id}', '${venda.cliente}')">
                            <i class="ph ph-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
            gridHistorico.innerHTML += cardHtml;
        });
    }

    const modalEditarVenda = document.getElementById('modal-editar-venda');

    window.abrirModalEditarVenda = function(id) {
        const venda = todasAsVendasBD.find(v => v.id === id);
        if (!venda) return;

        document.getElementById('edit-venda-id').value = venda.id;
        document.getElementById('edit-venda-cliente').value = venda.cliente;
        document.getElementById('edit-venda-produto').value = venda.produto_nome;
        
        let dataFormatada = venda.data_venda;
        if (venda.data_venda.includes('T')) {
            dataFormatada = venda.data_venda.split('T')[0];
        }
        document.getElementById('edit-venda-data').value = dataFormatada;
        
        document.getElementById('edit-venda-pagamento').value = venda.metodo_pagamento;
        document.getElementById('edit-venda-valor').value = venda.valor_venda;
        document.getElementById('edit-venda-custo').value = venda.valor_custo;

        modalEditarVenda.classList.remove('escondido');
    };

    document.getElementById('btn-fechar-modal-venda')?.addEventListener('click', () => {
        modalEditarVenda.classList.add('escondido');
    });

    document.getElementById('form-editar-venda')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const id = document.getElementById('edit-venda-id').value;
        const btn = this.querySelector('button[type="submit"]');
        btn.innerText = "Salvando...";
        btn.disabled = true;

        try {
            const dadosAtualizados = {
                cliente: document.getElementById('edit-venda-cliente').value.trim(),
                produto_nome: document.getElementById('edit-venda-produto').value.trim(),
                data_venda: document.getElementById('edit-venda-data').value,
                metodo_pagamento: document.getElementById('edit-venda-pagamento').value,
                valor_venda: parseFloat(document.getElementById('edit-venda-valor').value),
                valor_custo: parseFloat(document.getElementById('edit-venda-custo').value)
            };

            const { error } = await supabaseClient.from('vendas').update(dadosAtualizados).eq('id', id);
            if (error) throw error;

            modalEditarVenda.classList.add('escondido');
            exibirAviso("Venda Atualizada!", "As alterações foram salvas e o Dashboard foi recalculado.");
            carregarInteligenciaDashboard();
        } catch (erro) {
            exibirAviso("Erro ao Atualizar", erro.message, "erro");
        } finally {
            btn.innerHTML = '<i class="ph ph-check-circle"></i> Salvar Alterações';
            btn.disabled = false;
        }
    });

    document.getElementById('btn-excluir-venda-modal')?.addEventListener('click', () => {
        const id = document.getElementById('edit-venda-id').value;
        const cliente = document.getElementById('edit-venda-cliente').value;
        modalEditarVenda.classList.add('escondido');
        removerVendaDirecta(id, cliente);
    });

    window.removerVendaDirecta = function(id, cliente) {
        exibirConfirmacao(
            "Excluir Venda",
            `Deseja realmente apagar o registro da venda para <strong>"${cliente}"</strong>? Isso abaterá o valor do seu faturamento e lucro.`,
            async () => {
                try {
                    const { error } = await supabaseClient.from('vendas').delete().eq('id', id);
                    if (error) throw error;

                    exibirAviso("Venda Removida", "O registro foi apagado e o Dashboard recalculado.");
                    carregarInteligenciaDashboard();
                } catch (erro) {
                    exibirAviso("Erro ao excluir", erro.message, "erro");
                }
            }
        );
    };

    setTimeout(carregarInteligenciaDashboard, 1500);