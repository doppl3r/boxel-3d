const key = 'ck_0afcb61f6b31020dfafc1a289ef312e796913a6a';
const secret = 'cs_59a7807df521714ab500a63052df521a5fcb5cef';
const url = 'https://boxel3d.com/wp-json/wc/v3/products';

function getData(url) {
    $.ajax({
        url: url,
        method: 'GET',
        beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Basic ' + btoa(key + ':' + secret));
        }
    })
    .done(function (data) {
        console.log(data);
        return data;
    });
}

getData(url);