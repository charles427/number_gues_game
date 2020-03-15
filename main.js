
let GameContractMixin={

    data: {
      contracAddress:"ct_2L4DL5wwbE1VAd8eBMZEdpkDFZX9wt1YzJUKS4MoDZtNLpCqmc",
      contractSource : `
      payable contract NumberGuesContract =
          record player={
                   id : int,
                   name : string,
                   owner_address : address,
                   balance : int
                   }
      
          record gamer={
                id:int,
                name:string,
                gamer_address:address,
                balance:int
            }
      
          record state={
                 luky_number_sets : map(char,int),
                 games :map(int,gamer),
                 players     : map(int,player),
                 player_length:int
      
             }
             
          stateful entrypoint init() ={
              
               games={
                  [1] ={
                       id=1,
                       name="Number gess game",
                       gamer_address=Call.caller,
                       balance=10000000
                   }
                },
               luky_number_sets ={
                  ['a']=1,
                  ['b'] =25,
                  ['c'] =50,
                  ['d']=75,
                  ['e'] =100 
                   },//set of lacky number
                   players={},
                   player_length = 0
                 }
          stateful entrypoint register_player(p_name:  string) = 
              let index=get_total_player()+1
      
              let player ={
                   id   = index,
                   name = p_name,
                   owner_address = Call.caller,
                   balance =0
                   }
              put(state{players[index] = player,player_length=index})
              
              let game=getGame(1)
              spend_money(game.gamer_address,Call.value)
              let p_amount= player.balance+50
              let update_balance = state.players{[index].balance = p_amount }
              put(state {players = update_balance})
           
          entrypoint getPlayer(index:int)=
              switch(Map.lookup(index, state.players))
                         None => abort("There was no player found")
                         Some(value) => value
      
          entrypoint getGame(index:int)=
              switch(Map.lookup(index, state.games))
                         None => abort("There was no game found")
                         Some(value) => value
      
          entrypoint get_total_player():int =
              state.player_length
      
          entrypoint get_guesed_number(num:int): int=
              num
          
          entrypoint get_generated_random_number(random_num:int): int =
            random_num
          entrypoint get_base_lucky_number():int=
              state.luky_number_sets['c']
              
          entrypoint calculate_amount_winned(stake:int):int=
              if(stake >= 50)
                 stake*3
                  
              elif(stake >=100)   
                  stake*4
              else
               stake*2
          
          
          
        
          /**
           *
          **/
          stateful entrypoint check_if_win(index:int,r_num:int,isMax:bool,stake:int):bool=
                 let player=getPlayer(index)
                 let game =getGame(1)
      
                 if(isMax)
                   if(get_generated_random_number(r_num) >= get_base_lucky_number())
                       spend_money(player.owner_address,Call.value)
                       let p_amount= player.balance+calculate_amount_winned(stake)
                       let update_balance = state.players{[index].balance = p_amount }
                       put(state {players = update_balance})
      
                       let g_amount= game.balance - calculate_amount_winned(stake)
                       let update_balance2 = state.games{[1].balance = g_amount }
                       put(state {games = update_balance2})
                       true
                   else
                    spend_money(game.gamer_address,Call.value)
                    let g_amount= game.balance+stake
                    let update_balance = state.games{[1].balance = g_amount }
                    put(state {games = update_balance})
      
                    let p_amount= player.balance - stake
                    let update_balance2 = state.players{[index].balance = p_amount }
                    put(state {players = update_balance2})
                    false
                 else
                    if(get_generated_random_number(r_num) < get_base_lucky_number())
                       spend_money(player.owner_address,Call.value)
                       let p_amount= player.balance+calculate_amount_winned(stake)
                       let update_balance = state.players{[index].balance = p_amount }
                       put(state {players = update_balance})
      
                       
                       let g_amount= game.balance - calculate_amount_winned(stake)
                       let update_balance2 = state.games{[1].balance = g_amount }
                       put(state {games = update_balance2})
      
                       true
                    else
                      spend_money(game.gamer_address,Call.value)
                      let g_amount= game.balance+stake
                      let update_balance = state.games{[index].balance = g_amount }
                      put(state {games = update_balance})
      
                      let p_amount= player.balance - stake
                      let update_balance2 = state.players{[index].balance = p_amount }
                      put(state {players = update_balance2})
                      false 
      
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
    mixins:[GameContractMixin],

    data:function() {
          return {
            min: 0,
            max: 100,
            number: 0,
            isLoading :false,
            client:{},
            }
            },
  async  created() {

     await this.getClient();
     await this.getContractInstance();
      console.log(this.client);

        isLoading = true
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
      template :"walet-component-template",
      props: ['walet-amount']
}



var app = new Vue({
  el: '#app',
  mixins:[GameContractMixin],
  components:{
    'game-board-items':GameBordComponent
  },
async created(){
  await this.getClient();
  await this.getContractInstance();
  console.log(this.client);

}

})