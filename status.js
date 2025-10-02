function ticketWithStatuses($variable) {

    const tickets = {};
    const doneTickets = {};

    const watchedTicketsHash = ($variable[$variable.length - 1]).value.reduce((res, item) => {
        res[item.id] = item.title;
        return res;
    }, {});

    $variable.forEach(snapshot => {
        snapshot.value.forEach(ticket => {

            if (watchedTicketsHash[ticket.id]) {

                if (!tickets[ticket.id]) {
                    tickets[ticket.id] = { data: ticket, status: {} };
                }

                const ticketStatus = ticket.status;
                tickets[ticket.id].status[ticketStatus] = tickets[ticket.id].status[ticketStatus] || 0;
                tickets[ticket.id].status[ticketStatus]++;

                if (ticketStatus !== 'Done' && ticketStatus !== 'Closed' && !doneTickets[ticket.id]) {
                    const totalEffort = 'Total Effort';
                    tickets[ticket.id].status[totalEffort] = tickets[ticket.id].status[totalEffort] || 0;
                    tickets[ticket.id].status[totalEffort]++;
                } else {
                    doneTickets[ticket.id] = true;
                    delete tickets[ticket.id];
                }
            }
        });
    });

    return Object.keys(tickets).map(id => tickets[id]);
}


function stats($variable) {
    const totalStatusesCount = $variable.reduce((res, ticket) => {
        Object.keys(ticket.status).forEach(statusKey => {
            res[statusKey] = res[statusKey] || 0;
            res[statusKey] += ticket.status[statusKey];
            res[statusKey + '_COUNT'] = res[statusKey + '_COUNT'] || 0;
            res[statusKey + '_COUNT']++;
        });
        return res;
    }, {});

    return Object.keys(totalStatusesCount).reduce((res, ticketStatus) => {
        if (!ticketStatus.includes('COUNT')) {
            const number = totalStatusesCount[ticketStatus] / totalStatusesCount[ticketStatus + '_COUNT'];
            res[ticketStatus + '_AVERAGE'] = parseFloat(number.toFixed(2));
        } else {
            res[ticketStatus] = totalStatusesCount[ticketStatus];
        }

        return res;
    }, { TOTAL: $variable.length });
}

module.exports = {
    status(snapshots = []) {

        return ticketWithStatuses(snapshots);
    },
    stats(ticketsWithStatus = []) {

        return stats(ticketsWithStatus);
    }
};

/*
{return `${$variable.data.title} /${$variable.data.status}/ : ${JSON.stringify($variable.status)}\n`;}

{return $variable.sort((a,b) => {(a.status['Total Effort'] || 0) > (b.status['Total Effort'] || 0) ? -1 : 1;})}

{return $variable.sort((a, b) => {(a.status['Testing'] || 0) > (b.status['Testing'] || 0) ? -1 : 1;});}

{
    const ticketStatus = 'Testing';

    if (ticketStatus !== 'Done') {
        const totalEffort = 'Total Effort';
        $variable[totalEffort] = $variable[totalEffort] || 0;
        $variable[totalEffort]++;
    }

    $variable[ticketStatus] = $variable[ticketStatus] || 0;
    $variable[ticketStatus]++;
    return $variable;
}

*/

/*

{
    "stats": {
    "TOTAL": 34,
        "Review_AVERAGE": 5.24,
        "Review_COUNT": 21,
        "Total Effort_AVERAGE": 17.88,
        "Total Effort_COUNT": 34,
        "Testing_AVERAGE": 16.17,
        "Testing_COUNT": 18,
        "In Progress_AVERAGE": 8.28,
        "In Progress_COUNT": 25
}
}

*/
