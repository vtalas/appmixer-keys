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
    const totalStatusesCount = {};
    const statusValues = {};

    function calculateMedian(arr) {
        if (!arr.length) return null;
        const sorted = arr.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            return (sorted[mid - 1] + sorted[mid]) / 2;
        }
        return sorted[mid];
    }


    $variable.forEach(ticket => {
        Object.keys(ticket.status).forEach(statusKey => {
            totalStatusesCount[statusKey] = totalStatusesCount[statusKey] || 0;
            totalStatusesCount[statusKey] += ticket.status[statusKey];
            totalStatusesCount[statusKey + '_COUNT'] = totalStatusesCount[statusKey + '_COUNT'] || 0;
            totalStatusesCount[statusKey + '_COUNT']++;

            statusValues[statusKey] = statusValues[statusKey] || [];
            statusValues[statusKey].push(ticket.status[statusKey]);
        });
    });

    const result = { TOTAL: $variable.length };
    Object.keys(totalStatusesCount).forEach(ticketStatus => {
        if (!ticketStatus.includes('COUNT')) {
            const count = totalStatusesCount[ticketStatus + '_COUNT'];
            const avg = totalStatusesCount[ticketStatus] / count;
            result[ticketStatus + '_AVERAGE'] = parseFloat(avg.toFixed(2));
            result[ticketStatus + '_MED'] = calculateMedian(statusValues[ticketStatus]);
        } else {
            result[ticketStatus] = totalStatusesCount[ticketStatus];
        }
    });

    return result;
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
