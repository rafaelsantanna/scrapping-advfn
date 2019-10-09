module.exports = (app)=>{

    app.post('/scrapping', (req, res) => {
        const puppeteer = require('puppeteer');
        const excel = require('excel4node');
        let dados = req.body.dados;
        let listaCodigos = dados.codigos;
        let listaResultado = [];
        let indiceListaResultado = 0;
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

            let workbook = new excel.Workbook();
            let worksheet = workbook.addWorksheet('Resultado');
            let linhaCodigoExcel = 0;
            let estiloAlta = workbook.createStyle({
                fill: {
                    type: 'pattern',
                    patternType: 'solid',
                    fgColor: '#92d050',
                    bgColor: '#92d050'
                }
            });
            let estiloBaixa = workbook.createStyle({
                fill: {
                    type: 'pattern',
                    patternType: 'solid',
                    fgColor: '#bb4545',
                    bgColor: '#bb4545',
                }
            });
            let estiloNeutra = workbook.createStyle({
                fill: {
                    type: 'pattern',
                    patternType: 'solid',
                    fgColor: '#66ffff',
                    bgColor: '#66ffff',
                }
            });

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
                for(let j = 1; j <= filtroData; j++) {
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
                        alta: indicadorAlta,
                        baixa: indicadorBaixa,
                        neutra: indicadorNeutra
                    });
                }

                worksheet.cell(1 + linhaCodigoExcel,1).string(codigo);
                worksheet.cell(1 + linhaCodigoExcel,2).string('1M');
                worksheet.cell(1 + linhaCodigoExcel,3).string('5M');
                worksheet.cell(1 + linhaCodigoExcel,4).string('10M');
                worksheet.cell(1 + linhaCodigoExcel,5).string('15M');
                worksheet.cell(1 + linhaCodigoExcel,6).string('30M');
                worksheet.cell(1 + linhaCodigoExcel,7).string('60M');
                worksheet.cell(1 + linhaCodigoExcel,8).string('DIÁRIO');
                worksheet.cell(1 + linhaCodigoExcel,9).string('SEM');
                worksheet.cell(1 + linhaCodigoExcel,10).string('MEN');
                worksheet.cell(2 + linhaCodigoExcel,1).string('ALTA').style(estiloAlta);
                worksheet.cell(3 + linhaCodigoExcel,1).string('BAIXA').style(estiloBaixa);
                worksheet.cell(4 + linhaCodigoExcel,1).string('NEUTRO').style(estiloNeutra);


                for(let k = 0; k <= 8; k++) {
                    worksheet.cell(2 + linhaCodigoExcel, 2 + k).string(listaResultado[k + indiceListaResultado].alta).style(estiloAlta);
                    worksheet.cell(3 + linhaCodigoExcel, 2 + k).string(listaResultado[k + indiceListaResultado].baixa).style(estiloBaixa);
                    worksheet.cell(4 + linhaCodigoExcel, 2 + k).string(listaResultado[k + indiceListaResultado].neutra).style(estiloNeutra);
                }
                linhaCodigoExcel += 6;
                indiceListaResultado += 9;
                
                if(i == listaCodigos.length - 1) {
                    let today = new Date();
                    let date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
                    workbook.write('resultado_scrapping/' + date + '.xlsx');

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
