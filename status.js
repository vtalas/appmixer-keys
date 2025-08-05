module.exports = {
    status(data = []) {

        const tickets = {};

        data.forEach(item => {

            item.value.forEach(ticket => {

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
        }).sort((a, b) => {
            return (a.status['Total Effort'] || 0) > (b.status['Total Effort'] || 0) ? -1 : 1;
        });
    }
};

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

