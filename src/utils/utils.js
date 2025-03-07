export const utils = {

    getLogStatusColor(status) {
        const statusN = Number(status);
        if (statusN >= 200 && statusN < 300) {
            return 'green';
        } else if (statusN >= 300 && statusN < 400) {
            return 'orange';
        } else if (statusN >= 400 && statusN < 500) {
            return 'red';
        } else {
            return 'gray';
        }

        
    }
}