function addStatuses($variable) {

    const tickets = {};

    $variable.forEach(snapshot => {

        // const timestamp = snapshot.key
        snapshot.value.forEach(ticket => {

            if (!tickets[ticket.id]) {
                tickets[ticket.id] = { data: ticket, status: {} };
            }

            const ticketStatus = ticket.status;
            tickets[ticket.id].status[ticketStatus] = tickets[ticket.id].status[ticketStatus] || 0;
            tickets[ticket.id].status[ticketStatus]++;

            if (ticketStatus !== 'Done') {
                const totalEffort = 'Total Effort';
                tickets[ticket.id].status[totalEffort] = tickets[ticket.id].status[totalEffort] || 0;
                tickets[ticket.id].status[totalEffort]++;
            }
        });

    });

    return Object.keys(tickets).map(id => {
        return tickets[id];
    })

}

module.exports = {
    status(snapshots = []) {

        return addStatuses(snapshots);
    },
    stats(ticketsWithStatus = []) {

        const totalStatusesCount = ticketsWithStatus.reduce((res, ticket) => {
            Object.keys(ticket.status).forEach(statusKey => {
                res[statusKey] = res[statusKey] || 0;
                res[statusKey] += ticket.status[statusKey];
                res[statusKey + '_COUNT'] = res[statusKey + '_COUNT'] || 0;
                res[statusKey + '_COUNT']++;
            });
            return res;
        }, {});

        console.log(totalStatusesCount);
        const x = Object.keys(totalStatusesCount).reduce((res, ticketStatus) => {
            if (!ticketStatus.includes('COUNT')) {
                const number = totalStatusesCount[ticketStatus] / totalStatusesCount[ticketStatus + '_COUNT'];
                res[ticketStatus + '_AVERAGE'] = parseFloat(number.toFixed(2));
            } else {
                res[ticketStatus] = totalStatusesCount[ticketStatus];
            }

            return res;
        }, {});
        console.log(x);
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
