# Raphael Waldemar — hub de links

Homepage pessoal de Raphael Waldemar: uma página de apresentação profissional com links de contato, publicada pelo GitHub Pages em <https://raphaelwdrf.github.io/hub/>.

O site tem duas páginas equivalentes, uma por idioma:

- `index.html` — versão PT-BR (layout `default`)
- `index-en.html` — versão EN (layout `default-en`)

Este README descreve como o site é montado e publicado, para que ajustes futuros partam de um contexto claro.

## Stack

- **Jekyll** sobre **GitHub Pages**, com layout próprio (sem gem de tema): o `Gemfile` depende apenas de `gem 'github-pages'`.
- **Ruby 3.0.2** (`.ruby-version`).
- **Node + gulp** para o build de assets (`package.json`, `gulpfile.js`): SCSS → CSS, concat/uglify → JS, cópia de fontes e otimização de imagens.

## Estrutura

| Caminho | Papel |
| --- | --- |
| `_config.yml` | Configuração do site e **todo o conteúdo textual**, em blocos PT-BR e EN-US: `username`, `user_description`, `user_title`, `email` e `about_user_*` (mais os equivalentes `*_en`). Também define `exclude: ['package.json', 'src', 'node_modules', 'vendor']`. |
| `_layouts/` | `default.html` (PT) e `default-en.html` (EN): o esqueleto HTML que junta head + header + about + footer. |
| `_includes/` | Partes reutilizadas: `head.html`, `header.html` / `header-en.html`, `about.html` / `about-en.html` e `footer.html` (scripts). Os links sociais (LinkedIn, GoodReads, Spotify) ficam aqui, não no `_config.yml`. |
| `index.html`, `index-en.html` | Páginas do site; contêm apenas front matter com o `layout`. |
| `src/` | **Fontes editáveis dos assets**: `styles/**/*.scss`, `js/*.js`, `fonts/*`. Não é publicado (está no `exclude`). |
| `assets/` | **O que o site serve**: CSS, JS, fontes e favicon. Parte é gerada pelo gulp, parte é vendorizada à mão — ver [Pontos de atenção](#pontos-de-atenção). |
| `gulpfile.js`, `package.json` | Pipeline de build dos assets. |
| `Gemfile` | `gem 'github-pages'` (Jekyll + plugins compatíveis com o Pages). |

O diretório `_site/` é a saída do build do Jekyll: gerado localmente e ignorado pelo git.

## Rodar localmente

### Setup

```bash
bundle install   # Ruby 3.0.2 + Gemfile (gem 'github-pages')
npm install      # dependências do gulp (browser-sync, gulp-sass, gulp-uglify, ...)
```

### Preview

Para mexer em conteúdo (`_config.yml`, `_includes/`, `_layouts/`, HTML), o Jekyll sozinho já serve o site:

```bash
bundle exec jekyll serve     # http://127.0.0.1:4000
```

O fluxo de assets definido no `gulpfile.js` é:

```bash
npx gulp          # default: js → sass → fonts → browser-sync → watch
npx gulp sass     # src/styles/**/*.scss → assets/css/main.css
npx gulp js       # src/js/**/*.js      → assets/js/main.js
npx gulp fonts    # src/fonts/**/*      → assets/fonts/
npx gulp imagemin # src/img/**/*        → assets/img/   (a pasta src/img/ ainda não existe)
npx gulp jekyll-build
```

A task `default` roda `jekyll build` via `bundle exec` (spawn dentro do gulpfile), sobe o browser-sync em <http://localhost:3000> servindo `_site/` e recarrega a página ao salvar SCSS, JS ou HTML.

> **Estado atual do pipeline:** com as versões declaradas no `package.json` (gulp `^5.0.0`), o `gulpfile.js` não carrega — ele usa a sintaxe do Gulp 3 (`gulp.task('nome', ['dep'], fn)`), que falha em `AssertionError: Task function must be specified`. Além disso, o `gulp-sass@5` não traz compilador Sass (`gulp-sass no longer has a default Sass compiler`) e o pacote `sass` não está nas dependências. Enquanto isso não for ajustado (fora do escopo desta documentação), use `bundle exec jekyll serve` para preview e edite direto em `assets/` quando precisar de CSS/JS.

## Deploy

Publicação pelo **GitHub Pages** como página de projeto: <https://raphaelwdrf.github.io/hub/>

- **Origem:** branch `master`, raiz do repositório. É a única branch remota e não existe branch `gh-pages` nem workflow em `.github/` (só `FUNDING.yml`) — o build é o nativo do Pages.
- **Fluxo:** commit + push em `master` → o Pages refaz o build e publica. Não há CI para rodar antes nem passo manual de deploy.
- **O que é publicado:** o build aplica o `exclude` do `_config.yml`, então `src/`, `package.json`, `node_modules` e `vendor` ficam de fora. O navegador carrega exatamente o que está commitado em `assets/` (`assets/css/main.css`, `assets/js/main.js`, fontes).
- **Subcaminho:** o Pages publica o site sob `/hub`, e os templates montam as URLs com `| prepend: site.baseurl`. Por isso `baseurl` e `url` seguem comentados no `_config.yml`.

Fluxo típico de atualização: altere `src/` (assets) e/ou `_config.yml` / `_includes/` / `_layouts/` (conteúdo) → regenere `assets/` com o gulp → commit + push em `master`.

## Pontos de atenção

- **Gerado vs. editável.** `assets/css/main.css` (de `src/styles/main.scss` via `sass` + `csso`), `assets/js/main.js` (concatenação e minificação de `src/js/**/*.js`) e `assets/fonts/` (cópia de `src/fonts/`) são **gerados a partir de `src/`** — edite a fonte em `src/` e regenere; mexer no arquivo gerado se perde no próximo build. Já `assets/css/devicon.min.css`, `assets/js/particles.min.js`, `assets/js/sweet-scroll.min.js` e `assets/favicon.png` **não são gerados** (não têm origem em `src/`): são arquivos vendorizados, editáveis ou substituíveis direto em `assets/`.
- **Conteúdo vs. apresentação.** Os textos vivem no `_config.yml` (blocos `*` para PT-BR e `*_en` para EN); a estrutura HTML vive em `_includes/` e `_layouts/`. Ao mudar um texto, lembre de atualizar o par correspondente no outro idioma.
- **JS.** Todos os arquivos de `src/js/` são concatenados em um único `assets/js/main.js` (hoje só `app.js`); a ordem é a alfabética dos arquivos, então dependências entre eles exigem atenção ao nome.
- **imagemin.** A task aponta para `src/img/**/*.{jpg,png,gif}`, pasta que ainda não existe no repositório; ela só produz algo depois de criada.
- **gulp watch.** O watcher cobre `src/styles`, `src/js`, `src/fonts` e os HTML de `_includes/`/`_layouts/`, mas não `_config.yml` — mudanças de configuração/texto exigem reiniciar o processo. Também há um typo no padrão de fontes (`{tff,woff,woff2}`), então `.ttf` não é observado.
