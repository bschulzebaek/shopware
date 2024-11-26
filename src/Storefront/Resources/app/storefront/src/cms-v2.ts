enum CmsStructureType {
    PAGE = 'page',
    SECTION = 'section',
    BLOCK = 'block',
    SLOT = 'slot',
    ELEMENT = 'element',
}

enum CmsSelectors {
    PAGE = 'data-cms-page-id',
    SECTION = 'data-cms-section-id',
    BLOCK = 'data-cms-block-id',
    ELEMENT = 'data-cms-element-id',
}

type CmsPage = {
    id: string;
    node: Element;
    sections: CmsSection[];
}

type CmsSection = {
    id: string;
    node: Element;
    blocks: CmsBlock[];
}

type CmsBlock = {
    id: string;
    node: Element;
    elements: CmsElement[];
}

type CmsElement = {
    id: string;
    node: Element;
}

function buildCmsPages(): CmsPage[] {
    const cmsPages: CmsPage[] = [];

    const pages = document.querySelectorAll(`[${CmsSelectors.PAGE}]`);
    pages.forEach((page) => {
        const sections: CmsSection[] = [];
        const pageId = page.getAttribute(CmsSelectors.PAGE);

        page.querySelectorAll(`[${CmsSelectors.SECTION}]`).forEach((section) => {
            const blocks: CmsBlock[] = [];
            const sectionId = section.getAttribute(CmsSelectors.SECTION);

            section.querySelectorAll(`[${CmsSelectors.BLOCK}]`).forEach((block) => {
                const elements: CmsElement[] = [];
                const blockId = block.getAttribute(CmsSelectors.BLOCK);

                block.querySelectorAll(`[${CmsSelectors.ELEMENT}]`).forEach((element) => {
                    const elementId = element.getAttribute(CmsSelectors.ELEMENT);
                    element.setAttribute('draggable', 'true');
                    element.setAttribute('contenteditable', 'true');

                    element.addEventListener('dragstart', (event) => {
                        currentDragElement = element;
                    });
                    element.addEventListener('dragover', (event) => event.preventDefault());
                    elements.push({
                        id: elementId!,
                        node: element,
                    });
                });

                block.addEventListener('dragover', (event) => event.preventDefault());
                blocks.push({
                    id: blockId!,
                    node: block,
                    elements: elements,
                });
            });

            section.addEventListener('dragover', (event) => event.preventDefault());
            sections.push({
                id: sectionId!,
                node: section,
                blocks: blocks,
            });
        });

        page.addEventListener('dragover', (event) => event.preventDefault());
        page.addEventListener('drop', elementDropHandler, true);
        cmsPages.push({
            id: pageId!,
            node: page,
            sections: sections,
        });

    });


    return cmsPages;
}

let currentDragElement: null | Element = null;

function elementDropHandler(event: DragEvent) {
    const dropped = currentDragElement!;
    console.log(event)
    let target = (event.target as Element).closest(`
        [${CmsSelectors.BLOCK}],
        [${CmsSelectors.ELEMENT}],
        [${CmsSelectors.SECTION}]
    `)!;

    if (!target) {
       throw new Error('No drop target found');
    }

    console.log(target)
    // return;

    currentDragElement = null;

    const tmpSrc = dropped.cloneNode(true) as Element;
    const targetType = target.getAttribute(CmsSelectors.BLOCK) ? CmsStructureType.BLOCK : CmsStructureType.ELEMENT;

    switch (targetType) {
        case CmsStructureType.BLOCK:
            target.insertAdjacentElement('beforeend', tmpSrc);
            break;
        case CmsStructureType.ELEMENT:
            target.insertAdjacentElement('afterend', tmpSrc);
            break
    }

    dropped.remove();
}

const editModeStyles = `<style>
    [${CmsSelectors.PAGE}] {
        /*border: 1px dashed red;*/
    }

    [${CmsSelectors.SECTION}] {
        /*border: 1px dashed blue;*/
    }

    [${CmsSelectors.BLOCK}] {
        border: 1px dashed green;
    }

    [${CmsSelectors.ELEMENT}] {
        border: 1px dashed orange;
    }
</style>`;


if (location.search.includes('cmsEditMode')) {
    const cmsPages = buildCmsPages();
    document.head.insertAdjacentHTML('beforeend', editModeStyles);

    console.log(cmsPages);
}
