module.exports = (app)=>{

    app.post('/scrapping', (req, res) => {
        const puppeteer = require('puppeteer');
        const excel = require('excel4node');
        let dados = req.body.dados;
        let listaCodigos = dados.codigos;
        let listaResultado = [];
        (async () => {
            const browser = await puppeteer.launch(
                //{headless: false}
            );
            const page = await browser.newPage();
            await page.goto('https://br.advfn.com/bolsa-de-valores/bovespa/petrobras-PETR4/analise-tecnica/indicadores-de-preco');
                
            await page.type('#login_username', 'tiagosevero');
            await page.type('#login_password', 'rafael4533');

            await Promise.all([
                page.waitForNavigation(),
                await page.click('#login_submit')
            ]);

            let codigo = '';
            for(let i = 0; i < listaCodigos.length; i++) {
                codigo = listaCodigos[i];

                await page.evaluate(() => {
                    document.querySelector('#symbol_entry').value = '';
                });
                
                await page.type('#symbol_entry', 'BOV:' + codigo);
                
                
                await Promise.all([
                    page.waitForNavigation(),
                    await page.click('#symbol_ok')
                ]);

                let filtroData = 9;
                for(let j = 1; j < filtroData; j++) {
                    await Promise.all([
                        page.waitForNavigation(),
                        await page.click('#underlinemenu > ul > li:nth-child('+j+') > a')
                    ]);
                       
                    const alta = await page.$('#afnmainbodid > div:nth-child(12) > div:nth-child(2) > div > div.resband1 > table > tbody > tr:nth-child(1) > td:nth-child(2) > b');
                    const indicadorAlta = await page.evaluate(element => element.textContent, alta);
                    
                    const baixa = await page.$('#afnmainbodid > div:nth-child(12) > div:nth-child(2) > div > div.resband1 > table > tbody > tr:nth-child(2) > td:nth-child(2) > b');
                    const indicadorBaixa = await page.evaluate(element => element.textContent, baixa);
                    
                    const neutra = await page.$('#afnmainbodid > div:nth-child(12) > div:nth-child(2) > div > div.resband1 > table > tbody > tr:nth-child(3) > td:nth-child(2) > b');
                    const indicadorNeutra = await page.evaluate(element => element.textContent, neutra);
                    
                    listaResultado.push({
                        codigo: codigo,
                        alta: indicadorAlta,
                        baixa: indicadorBaixa,
                        neutra: indicadorNeutra
                    });
                }

                if(i == listaCodigos.length - 1) {
                    console.log('gravar no XLS');
                    console.log(listaResultado);

                    res.json({
                        success: true                    
                    });
                    console.log('Teste Finalizado');
                }
            }
            await browser.close();
        })();
    });
};
