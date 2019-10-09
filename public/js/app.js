new Vue({
    el: '#app',
    data: {
        listaCodigos: '',
        loading: false
    },
    methods: {
        iniciarTeste: function () {
            var vm = this;
            vm.loading = true;
            axios.post('/scrapping', {
                dados: {
                    codigos: vm.listaCodigos.split('\n')
                }
            })
            .then(function(response) {
                vm.loading = false;
            })
            .catch(function(err) {
                console.log(err);
            });
        }
    }
});