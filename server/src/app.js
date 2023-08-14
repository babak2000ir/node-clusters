//import node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import process from 'node:process';

//import npm
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import Router from 'koa-router';

const numCPUs = availableParallelism();

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < Math.min(numCPUs, 4); i++) {
      cluster.fork();
    }
  
    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    })
} else {
    console.log(`Cluster ${process.pid} is running by Primary ${process.ppid}`);
    //init
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const app = new Koa();
    const router = new Router();
    app.use(bodyParser());

    app.use(async (ctx, next) => {
        const timeStamp = `${(new Date()).toLocaleDateString('en-GB')} ${(new Date()).toLocaleTimeString('en-GB')}`;
        console.log(`${timeStamp} ${ctx.request.method} '${ctx.request.url}' ${JSON.stringify(ctx.request.body)}`);
        await next();
    });

    router.post('/shortCall', async (ctx) => {
        ctx.body = await asyncDelayCall(5000);
    });

    router.post('/longCall', async (ctx) => {
        ctx.body = await asyncDelayCall(10000);
    });

    router.post('/heavyCall', async (ctx) => {
        ctx.body = heavyCall();
    });

    router.post('/heavyCallAsync', async (ctx) => {
        ctx.body = await heavyCallAsync();
    });

    app.use(router.routes());

    app.use(serve(path.join(__dirname, '/client')));


    app.listen(3000);
    console.log("Server is listening on port 3000");

    async function asyncDelayCall(duration) {
        const startTime = Date.now();
        const resp = `process:${process.pid} `
        await new Promise(resolve => setTimeout(resolve, duration))
            .catch(err => {
                console.log(err);
                resp = `${resp}: failed: ${err}`;
            });
        const endTime = Date.now();
        return resp + `: ${endTime - startTime}ms`;
    }

    function heavyCall() {
        const startTime = Date.now();
        let i = 0;
        for (i = 0; i < 1000000000; i++) {
            for (let j = 0; j < 100; j++) {
                let dummy = Math.log1p(j) + Math.log1p(i);
            }
            let dummy = Math.log1p(i);
        }
        const endTime = Date.now();
        return `process:${process.pid}: ${endTime - startTime}ms`;
    }

    function heavyCallAsync() {
        const startTime = Date.now();
        return new Promise(resolve => {
            let i = 0;
            for (i = 0; i < 1000000000; i++) {
                for (let j = 0; j < 100; j++) {
                    let dummy = Math.log1p(j) + Math.log1p(i);
                }
                let dummy = Math.log1p(i);
            }
            resolve(`process:${process.pid}: ${Date.now() - startTime}ms`);
        });
    }
}
