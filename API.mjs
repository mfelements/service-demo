import { createServer } from 'http'

function getRequestData(req){
    if(req.method === 'GET') return [];
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(JSON.parse(data)));
        req.on('error', reject)
    })
}

const headers = {
    'Access-Control-Allow-Origin': '*',
};

export default class API{
    constructor(port){
        createServer(async (req, res) => {
            const method = decodeURIComponent(req.url.slice(1));
            if(typeof this[method] !== 'function'){
                res.writeHead(200, headers);
                res.end(JSON.stringify({
                    error: `Method ${method} not implemented`
                }))
            } else {
                res.writeHead(200, headers);
                if(req.method === 'OPTIONS') return res.end();
                try{
                    const data = await getRequestData(req),
                        result = await this[method](...data);
                    res.end(JSON.stringify({
                        data: result
                    }))
                } catch(e){
                    res.end(JSON.stringify({
                        error: e.message
                    }))
                }
            }
        }).listen(port)
    }
}
