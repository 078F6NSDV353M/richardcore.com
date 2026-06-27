```text
Да, сейчас четыре разных стандарта.

Нужно привести к одному:

1. Единая ширина меню.
2. Единая сетка цветов: 7 × 2.
3. Единый порядок цветов.
4. Единый размер кружков.
5. Белый и чёрный добавить везде, где это color menu.
6. Line / Lock / Delete остаются ниже или выше по смыслу объекта.
```

```text
Предлагаю стандарт:

Menu width: 210px

Color grid:
7 колонок по 20px
gap: 8px
justify-content: center

Color button:
20 × 20
border-radius: 999px
border: 2px solid rgba(255,255,255,0.18)

Палитра:
#FF2ED5
#FF2E7B
#FF3636
#FF8000
#FFEA00
#BFFF00
#FFFFFF
#00FF40
#00FFCC
#00D0FF
#0095FF
#5768FF
#9B30FF
#000000
```

```text
По визуальной логике:

Node menu:
Color grid сверху, потом действия.

Connection menu:
Color submenu сделать такой же сеткой 7×2.

Zone menu:
Line сверху, Color grid 7×2, потом Lock/Delete.

TextLabel menu:
уже почти эталон, только можно выровнять gap/order.

Multiselect:
Color grid 7×2, тот же размер и порядок.
```

```text
Скидывай CSS-файлы меню или текущие куски:

construct-nodes.css
construct-connections.css
construct-zones.css

И я дам точные замены блоков.
```



===================================
Вот теперь картина понятна.

У тебя уже есть:

construct-workspace-menu.js
construct-node-menu.js
construct-connection-menu.js
construct-zone-menu.js
construct-multiselect-menu.js

То есть половина архитектуры уже правильная.

Я бы делал реорганизацию в таком порядке:

ШАГ 1

Вытащить весь CSS меню из:

construct-nodes.css
construct-connections.css
construct-zones.css

в отдельные файлы:

construct-workspace-menu.css
construct-node-menu.css
construct-connection-menu.css
construct-zone-menu.css
construct-multiselect-menu.css
construct-text-label-menu.css

Без изменения JS вообще.

ШАГ 2

Проверить, нет ли логики Workspace Menu внутри
construct-node-menu.js.

Потому что раньше я уже видел в этом файле функцию:

openWorkspaceContextMenu()

Если она там до сих пор есть, её нужно вернуть в
construct-workspace-menu.js.

Это первый JS-кандидат на вынос.

ШАГ 3

Text Label сейчас смешан:

construct-text-labels.js

Там одновременно:

- объект Text Label
- drag
- resize
- selection
- context menu

Я бы потом разделил на:

construct-text-labels.js
construct-text-label-menu.js

Но не сейчас.

Перед тем как давать конкретные правки, нужен только один файл:

construct-workspace-menu.js

Потому что я хочу проверить, нет ли уже там части логики меню,
чтобы не получить второй раз историю с дублированием Workspace Menu.