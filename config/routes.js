module.exports = {
  'home': {
    matches: '/',
    controller: 'home#index',
    methods: 'get/post'
  },
  
  'home_with_params': {
    matches: '/:params',
    controller: 'home#index',
    methods: 'get/post'
  },
}
