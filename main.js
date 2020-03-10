
let GameContract={

    data: {
      contracAddress:"cccc",
      contractSource : `
      payable contract NumberGuesContract =
          record player={
                   id : int,
                   name : string,
                   owner : address,
                   balance : int
                   }
      
          record state={
                 luky_number_sets : map(int,int),
                 players     : map(int,player),
                 player_length:int
      
             }
             
          stateful entrypoint init() ={
               luky_number_sets ={
                  [00]=0,
                  [11] =25,
                  [22] =50,
                  [33]=75,
                  [44] =100 
                   },//set of lacky number
                   players={},
                   player_length = 0
                 }
          entrypoint register_player(p_name:string) = {
      
           }
      
          entrypoint get_total_player():int =
              state.player_length
      
          entrypoint get_guesed_number(num:int): int=
              num
          
          entrypoint get_generated_random_number(random_num:int): int =
            random_num
      
          entrypoint check_if_win(num:int)={
      
      
           }
      
          payable stateful entrypoint  spend_money(to:address,amount:int)=
             Chain.spend(to,amount)
      
      
         

      `,
          client: {},
          contractInstance: null,
      },

    methods: {
      async getClient() {
        try {
         this.client = await Ae.Aepp();
        }catch (err) {
            console.log(err);
           }
        },
      async getContractInstance() {
        this.contractInstance = await this.client.getContractInstance(this.contractSource, { contractAddress: this.contractAddress });
       },
       


      async  callStatic(func,args){
     
        const calledGet =await this.contractInstance.call(func,args,{callStatic : true}).catch(e =>console.error(e))
    
        const decodedGet = await calledGet.decode().catch(e =>console.error(e));
        console.log(decodedGet)
        return decodedGet;
    },
    
    async  contractCall(func, args,value) {
    
        const calledGet =await this.contractInstance.call(func,args,{amount : value}).catch(e =>console.error(e))
        console.log(calledGet)
        return calledGet;
      },
      },

}

let GameBordComponent = {
    template:"#game-board-template",
    // props:['min','max','number'],
    data() {
          return {
            min: 0,
            max: 100,
            number: 0,
            isLoading :false
            
            }
            },
    created: function () {
        isLoading = true
        GameContract.getClient
        this.getRandomNumber()
        isLoading = false;
       

        },
    methods: {
        loadNum: function () {
            this.min = 1;
            this.max = 10;
            this.getRandomNumber();
         
            },
    getInput: function () {
            let min = Number(this.min)
            let max = Number(this.max)
            if(min > max) {
                [min, max] = [max, min]
            }
                this.min = min
                this.max = max
                this.getRandomNumber()
              },
    getRandomNumber: function () {
            this.number = this.generateNumber()
            },
    generateNumber: function () {
          return Math.floor(Math.random()*(this.max-this.min+1)+this.min);
          },
    restart: function(){
            this.number=0
          }
    }


}
let WalletCommponet = {

}



var app = new Vue({
  el: '#app',
  components:{
    'game-board-items':GameBordComponent
  },
})