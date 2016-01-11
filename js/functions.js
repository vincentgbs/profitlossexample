/* General number functions */

// update symbol within span object
function changeSymbol(span, symbol)
{
    if (span) {
        span.innerHTML = symbol;
    }
}
// return number from string
function parseNumber(num)
{
    return parseFloat(num.replace(/[^0-9\.\-]+/g,""));
}
// display number as currency
function readableCurrency(num)
{
    return "$" + String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
}



/* Account nesting functions */
// On click, expand/close nested accounts, change totals in account and update graph values
$(".account").on("click", function(e) {
    if (!$(this).attr('children')) {
        // If the account does not have any nested accounts, do nothing
        return false;
    }
    // return list of child accounts
    /* children = ['acct1', 'acct2'] */
    var children = JSON.parse($(this).attr('children'));
    var selector = "";
    // check if expanding or closing nested accounts
    var open = $(this).attr('open');
    values = {};
    $.each(children, function (k, v) {
        selector += "#" + v + ", ";
        array = [];
        $.each($('#'+v).children('td'), function(key, value) {
            array.push(parseNumber(value.innerHTML));
        });
        v = v + "|" + $('#'+v).attr('name');
        values[v] = array;
    });
    // create array of values
    /* value = {
        acct1: [1, 2, 3],
        acct2: [4, 5, 6]
    } */
    selector = selector.substr(0, selector.length-2);
    /* selector = '#acct1, acct2, acct3' */

    /* Change value based on all values in children accounts.
    The change values only matter to the account rows, not the graph */
    $.each($(this).children('td'), function(k, v) {
        var amount = parseNumber(v.innerHTML);
        $.each(values, function (key, value) {
            if (open) {
                amount += value[k];
            } else {
                amount -= value[k];
            }
        });
        // change the values displayed in the html
        v.innerHTML = readableCurrency(amount);
    });

    // open or close effects (procedural)
    if (open) {
        changeSymbol($(this).find('th').find('span')[0], '&#9899');
        $(selector).hide();
        $(this).attr('open', false);
        updateChart(values, false);
    } else {
        changeSymbol($(this).find('th').find('span')[0], '&#9898');
        $(selector).show();
        $(this).attr('open', true);
        updateChart(values, true);
    }
    return;
});



/* Percent functions */
// display percent box when expenses are hovered over
$(".range").hover(function () {
    setTimeout(function(){
        $("#percents").show();
    }, 500);
    $("#" + $(this).attr('acctid') + $(this).attr('colid')).show();
}, function() {
    $("#" + $(this).attr('acctid') + $(this).attr('colid')).hide();
});
// minimize percent box
$(document).keyup(function(e) {
    if (e.keyCode == 27) {
        $("#percents").hide();
    }
});
$( "#percent_hide" ).on("click", function() {
    $("#percents").hide();
});

// add calendar symbol and selector to inputs
$( ".datepicker" ).datepicker({
    showOn: "button",
    buttonImage: "img/calendar.gif",
    buttonImageOnly: true,
    buttonText: "select date",
    dateFormat: 'yy-mm-dd'
});



/* Chart functions */
// Global options for chart
var options = {
    multiTooltipTemplate: "<%=datasetLabel%>: <%= value %>",
}
var ctx = $("#line_graph").get(0).getContext("2d");
// update values for the chart
function updateChart(values, add)
{
    if (add) {
        // add values of children accounts
        $.each(values, function (key, value) {
            key = key.split('|');
            if (!(data['datasets'][key[0]])) {
                data['datasets'][key[0]] = {
                    label: key[1],
                    fillColor: "rgba(255,255,255,0)",
                    strokeColor: "rgba(0,0,0,1)",
                    pointColor: "rgba(0,0,0,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(0,0,0,1)",
                    data: value
                };
            }
        });
    } else {
        // remove values of children accounts
        $.each(values, function (key, value) {
            key = key.split('|');
            delete (data['datasets'][key[0]]);
        });
    }
    new Chart(ctx).Line(data, options);
}
// display chart after page loads
new Chart(ctx).Line(data, options);
