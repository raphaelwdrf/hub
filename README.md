# Raphael Waldemar — hub de links

Homepage pessoal de Raphael Waldemar: uma página de apresentação profissional com links de contato, publicada pelo GitHub Pages em <https://raphaelwdrf.github.io/hub/>.

O site tem duas páginas equivalentes, uma por idioma:

- `index.html` — versão PT-BR (layout `default`)
- `index-en.html` — versão EN (layout `default-en`)

Este README descreve como o site é montado e publicado, para que ajustes futuros partam de um contexto claro.

## Stack

- **Jekyll** sobre **GitHub Pages**, com layout próprio (sem gem de tema): o `Gemfile` depende apenas de `gem 'github-pages'`.
- **Ruby 3.3.8** (`.ruby-version`) + **Bundler 2.6.7**. As gems do projeto vão para `vendor/bundle` por causa do `.bundle/config` versionado (`BUNDLE_PATH: vendor/bundle`), então **não precisa de `sudo`**; `vendor/` está no `.gitignore`.
- **Node + Gulp 5** para o build de assets (`package.json`, `gulpfile.js`): SCSS → CSS (Dart Sass via `gulp-sass` + `sass`), concat + uglify → JS, cópia binária de fontes e otimização de imagens.

## Estrutura

| Caminho | Papel |
| --- | --- |
| `_config.yml` | Configuração do site e **todo o conteúdo textual**, em blocos PT-BR e EN-US: `username`, `user_description`, `user_title`, `email` e `about_user_*` (mais os equivalentes `*_en`). Também define `exclude: ['package.json', 'src', 'node_modules', 'vendor']`. |
| `_layouts/` | `default.html` (PT) e `default-en.html` (EN): o esqueleto HTML que junta head + header + about + footer. |
| `_includes/` | Partes reutilizadas: `head.html`, `header.html` / `header-en.html`, `about.html` / `about-en.html` e `footer.html` (scripts). Os links sociais (LinkedIn, GoodReads, Spotify) ficam aqui, não no `_config.yml`. |
| `index.html`, `index-en.html` | Páginas do site; contêm apenas front matter com o `layout`. |
| `src/` | **Fontes editáveis dos assets**: `styles/**/*.scss`, `js/*.js`, `fonts/*` e `img/`. Não é publicado (está no `exclude`) e é a **fonte da verdade**: edite aqui e regenere `assets/`. |
| `assets/` | **O que o site serve**: CSS, JS, fontes e favicon. Parte é gerada pelo gulp a partir de `src/`, parte é vendorizada à mão — ver [Pontos de atenção](#pontos-de-atenção). |
| `gulpfile.js`, `package.json` | Pipeline de build dos assets. |
| `Gemfile`, `.ruby-version`, `.bundle/config` | Toolchain Ruby do preview local (`github-pages`); o `.bundle/config` fixa `BUNDLE_PATH: vendor/bundle`. |
| `Gemfile.lock` | **Não versionado** de propósito (ver [Pontos de atenção](#pontos-de-atenção)); gerado localmente pelo `bundle install` de cada ambiente. |

O diretório `_site/` é a saída do build do Jekyll: gerado localmente e ignorado pelo git.

## Rodar localmente

### Setup

```bash
bundle install   # Ruby 3.3.8 + gem 'github-pages'; gems em vendor/bundle, sem sudo
npm install      # dependências do gulp (browser-sync, gulp-sass, sass, gulp-uglify, ...)
```

### Preview

Para mexer em conteúdo (`_config.yml`, `_includes/`, `_layouts/`, HTML), o Jekyll sozinho já serve o site:

```bash
bundle exec jekyll build     # gera _site/
bundle exec jekyll serve     # http://127.0.0.1:4000
```

O fluxo de assets definido no `gulpfile.js` é:

```bash
npx gulp          # default: js → sass → fonts → browser-sync → watch
npx gulp sass     # src/styles/**/*.scss → assets/css/main.css
npx gulp js       # src/js/**/*.js      → assets/js/main.js
npx gulp fonts    # src/fonts/**/*      → assets/fonts/
npx gulp imagemin # src/img/**/*        → assets/img/   (pasta vazia: no-op)
npx gulp jekyll-build
```

A task `default` roda `jekyll build` via `bundle exec` (spawn dentro do gulpfile), sobe o browser-sync em <http://localhost:3000> servindo `_site/` e recarrega a página ao salvar SCSS, JS ou HTML.

**Assets: edite em `src/`, não em `assets/`.** O CSS, o JS e as fontes servidos pelo site são gerados a partir de `src/` (`npx gulp sass`, `npx gulp js`, `npx gulp fonts`); alterações feitas direto em `assets/` se perdem na próxima regeneração.

## Deploy

Publicação pelo **GitHub Pages** como página de projeto: <https://raphaelwdrf.github.io/hub/>

- **Origem:** branch `master`, raiz do repositório. É a única branch remota e não existe branch `gh-pages` nem workflow em `.github/` (só `FUNDING.yml`) — o build é o nativo do Pages.
- **Fluxo:** commit + push em `master` → o Pages refaz o build e publica. Não há CI para rodar antes nem passo manual de deploy.
- **O que é publicado:** o build aplica o `exclude` do `_config.yml`, então `src/`, `package.json`, `node_modules` e `vendor` ficam de fora. O navegador carrega exatamente o que está commitado em `assets/` (`assets/css/main.css`, `assets/js/main.js`, fontes).
- **Subcaminho:** o Pages publica o site sob `/hub`, e os templates montam as URLs com `| prepend: site.baseurl`. Por isso `baseurl` e `url` seguem comentados no `_config.yml`.

Fluxo típico de atualização: altere `src/` (assets) e/ou `_config.yml` / `_includes/` / `_layouts/` (conteúdo) → regenere `assets/` com o gulp → commit + push em `master`.

## Pontos de atenção

- **Paridade `src/` ↔ `assets/`.** O `assets/` commitado bate com o que o gulp gera hoje: `assets/css/main.css`, `assets/js/main.js` e `assets/fonts/**` são idênticos às fontes em `src/`. Ao mudar algo em `src/`, rode a task correspondente e commite o resultado junto.
- **Gerado vs. editável.** `assets/css/main.css` (de `src/styles/main.scss` via `sass` + `csso`), `assets/js/main.js` (concatenação e minificação de `src/js/**/*.js`) e `assets/fonts/` (cópia byte-a-byte de `src/fonts/`) são **gerados a partir de `src/`**. Já `assets/css/devicon.min.css`, `assets/js/particles.min.js`, `assets/js/sweet-scroll.min.js` e `assets/favicon.png` **não são gerados** (não têm origem em `src/`): são arquivos vendorizados, editáveis ou substituíveis direto em `assets/`.
- **Outline de foco ausente por declaração do `src/`.** `.down` e `.header-icons a` declaram `outline: 0 !important` em `src/styles/_header.scss` (linhas 68–71 e 116–119), então esses links **não mostram o outline de foco** do navegador. É o comportamento que o `src/` sempre declarou — o CSS commitado tinha perdido essas regras em 2020 e a regeneração as restaurou. **É intencional, não um defeito.**
- **`imagemin` é no-op.** `src/img/` existe apenas com um `.gitkeep`, para a task e o watcher não estourarem com `ENOENT`; não há imagens para otimizar até que alguma seja adicionada.
- **`Gemfile.lock` não versionado.** Foi gerado localmente mas não é commitado de propósito: o GitHub Pages resolve as gems sozinho a partir do `github-pages`, e um lock novo poderia alterar o build do Pages. Se quiser reprodutibilidade total, é só commitá-lo.
- **Conteúdo vs. apresentação.** Os textos vivem no `_config.yml` (blocos `*` para PT-BR e `*_en` para EN); a estrutura HTML vive em `_includes/` e `_layouts/`. Ao mudar um texto, lembre de atualizar o par correspondente no outro idioma.
- **JS.** Todos os arquivos de `src/js/` são concatenados em um único `assets/js/main.js` (hoje só `app.js`); a ordem é a alfabética dos arquivos, então dependências entre eles exigem atenção ao nome.
- **gulp watch.** O watcher cobre `src/styles`, `src/js`, `src/fonts`, `src/img` e os HTML de `_includes/`/`_layouts/`, mas não `_config.yml` — mudanças de configuração/texto exigem reiniciar o processo.
