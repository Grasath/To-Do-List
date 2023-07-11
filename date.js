module.exports.getDate=function () {
    let day = new Date();
    let option = {
        weekday: "long", month: "long", day: "numeric"
    };
    return day.toLocaleDateString("en-us", option);
}

exports.getDay = ()=>{
    let day = new Date();
    let option = {
        weekday: "long"
    };
    return day.toLocaleDateString("en-us", option);
}