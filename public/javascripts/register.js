$(() => {
    var search = window.location.search;
    var parameter = new URLSearchParams(search);

    if (parameter.has('fbid')) {
        $('#fbid').val(parameter.get('fbid'));
    }
})