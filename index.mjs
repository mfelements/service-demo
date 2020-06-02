import APIProto from './API.mjs'

const pages = {
    main: {
        type: 'page',
        childs: [
            {
                type: 'block',
                childs: [
                    'Эта страница сгенерирована сервером',
                    [ // блок для группировки элементов внутри в строку
                        {
                            type: 'button',
                            onClick: {
                                action: 'getPage',
                                args: ['second']
                            },
                            text: '➡️ Перейти на следующую страницу',
                        },
                        {
                            type: 'button',
                            onClick: {
                                action: 'throwServerError',
                            },
                            text: '🛑 Вызвать ошибку на сервере',
                        },
                    ],
                    {
                        type: 'image',
                        src: 'https://png.pngtree.com/thumb_back/fw800/back_our/20190617/ourmid/pngtree-blue-tech-abstract-background-image_128874.jpg',
                        ratio: '1:1',
                        width: '40%',
                        round: true,
                    },
                ],
            },
            [
                'Кол-во просмотров этой страницы (автоматически обновляемых каждые 5с.): ',
                {
                    type: 'dynamic',
                    update: {
                        action: 'getWatchesCount',
                        args: ['main']
                    },
                    default: [ 0 ],
                    interval: 5000,
                }
            ],
            [
                'Кол-во кликов по кнопке (нажмите, чтобы обновить): ',
                {
                    type: 'editable',
                    id: 'clickCountEditable',
                    default: [],
                },
            ],
        ]
    },
    second: {
        type: 'page',
        childs: [
            'А вот эта страничка уже должна быть отрендерена вне блока',
            {
                type: 'button',
                onClick: {
                    action: 'getPage',
                    args: ['main']
                },
                text: '⬅️ Назад'
            },
        ]
    },
}

const pageWatches = {},
    btnClicks = {},
    clickButtonTpl = pages.main.childs[2][1];

class API extends APIProto{
    constructor(port){
        super(port);
        clickButtonTpl.default = this.updateClicksButton('clickCountEditable').data;
    }
    getPage(name){
        if(!pageWatches[name]) pageWatches[name] = 1;
        else pageWatches[name]++;
        return pages[name]
    }
    getWatchesCount(page){
        const watches = pageWatches[page] || 0;
        return [ watches ]
    }
    btnClick(id){
        if(!btnClicks[id]) btnClicks[id] = 1;
        else btnClicks[id]++;
        return this.updateClicksButton(id)
    }
    updateClicksButton(id){
        const data = [
            {
                type: 'button',
                onClick: {
                    action: 'btnClick',
                    args: [ id ]
                },
                text: `🔄 Кликов: ${btnClicks[id] || 0}`,
            },
        ];
        clickButtonTpl.default = data;
        return {
            type: 'edit',
            id,
            data,
        }
    }
    throwServerError(){
        throw new Error('Error description from server')
    }
}

new API(/* port */ 8553)
