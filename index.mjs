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
                                action: 'getWatchesCount',
                                args: ['main', 'watchesCountEditable']
                            },
                            text: '🔄 Обновить кол-во просмотров',
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
            'Кол-во просмотров этой страницы за текущую сессию сервера: ',
            {
                type: 'dynamic',
                template: 'автоматически обновляемых (каждые 5с.): %d; ',
                update: {
                    action: 'getWatchesCount',
                    args: ['main']
                },
                default: [ 0 ],
                interval: 5000,
            },
            {
                type: 'editable',
                id: 'watchesCountEditable',
                template: 'вручную обновляемых (нажмите кнопку, чтобы обновить): %d',
                default: [ 0 ],
            },
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

const pageWatches = {};

class API extends APIProto{
    getPage(name){
        if(!pageWatches[name]) pageWatches[name] = 1;
        else pageWatches[name]++;
        return pages[name]
    }
    getWatchesCount(page, id){
        const watches = pageWatches[page] || 0;
        if(id) return {
            type: 'edit',
            id,
            data: [ watches ],
        };
        else return [ watches ]
    }
    throwServerError(){
        throw new Error('Error description from server')
    }
}

new API(/* port */ 8553)
