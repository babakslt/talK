wizard = {
  init:function(url){
  wiz = this;
    $.ajax({
    type: 'POST',
    url: url,
    data: {"q":"start"},
    complete: function(r){
      ajaxData = r.responseText;
      d = JSON.parse(ajaxData);
      $.each(d.statements,function(i,s){wiz.make.handleStt(s)});
      wiz.make.after();
    }
  }); 
  },
  make:{
    //---------- Handel each Statement and Break it to Q and A and send it to the QA Handler --------------------------------------------
    handleStt :function(stt){
      //-------- Each Statement goes in a SPAN tag and have a Class of 'statement' and 'hide' -------------------------------------------
      span = wiz.make.makeEl("span");
      $(span).addClass("statement hide");
      //-------- For Each Part of THE Statement (Q,A) calls the QA Handler --------------------------------------------------------------
      $.each(stt,function(i,s){wiz.make.handleQA(i,s)});
      //-------- Append the Whole span to the Wizard ------------------------------------------------------------------------------------
      $(".wizard").append(span);
    },
    //---------- Recive Q and A of the statement, make the HTML Element and send the content to WordHandler -----------------------------
    handleQA:function(t,s){
      //-------- Make a DIV Element for Q/A and set the Class to 'q'/'a'(as in t) -------------------------------------------------------
      stt = wiz.make.makeEl("div");
      $(stt).addClass(t);
      //-------- Each Q/A is made of some WORDS. Break the q/a to words and call the WORD HANDLER ---------------------------------------
      $.each(s,function(i,w){
        $(stt).append(wiz.make.handleWord(w));
      });
      
      //-------- Appends the STT(whole Q/A) to the SPAN(whole Statement) ----------------------------------------------------------------
      $(span).append(stt);
    },
    //---------- Handel THE WORD (TEXT,VAR,AJAX,...) - Choose the specific handler and send data to it ----------------------------------
    handleWord:function(w){
      //-------- W - is the word. each word is a part of an statement(Q/A) --------------------------------------------------------------
      //-------- If THE WORD is a TEXT, Makes a <i> and put THE WORD CONTENT in it ------------------------------------------------------
      if(w.type=="text"){
        word = wiz.make.makeEl("i");
        $(word).html(w.content);
      }
      //-------- If THE WORD is a VARIABLE, Sends it to the getVariableItems to extract to THE VARIABLE ITEMS from JSON DATA ------------
      else if(w.type=="var")
        word = wiz.make.getVarItems(w);
      //-------- If THE WORD is a AJAX WORD, calls the AjaxWord to deal with it! --------------------------------------------------------
      else if(w.type=="ajax")
        word = wiz.make.ajaxWord(w);
      //-------- If THE WORD is a AJAX WORD, calls the AjaxWord to deal with it! --------------------------------------------------------
      else if(w.type=="submit")
        word = wiz.make.submit(w);

      return word;
    },
    //---------- AJAX WORD specific Handler. it will make a AJAXLOADER statement --------------------------------------------------------
    ajaxWord:function(w){
      $(span).addClass("ajaxst");
      ajax = wiz.make.makeEl("div");
      $(ajax).addClass("ajax isloading show").html('<div class="windows8"><div class="wBall" id="wBall_1"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_2"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_3"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_4"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_5"><div class="wInnerBall"></div></div></div>');
      return ajax;
    },
    //---------- Get Variable(DROPDOWN) Items from JSON data and make the SELECT element ------------------------------------------------
    getVarItems:function(w){
      sl = wiz.make.makeEl("select");
      $(sl).addClass("drop").attr("name",w.name);
      var pl = wiz.make.makeEl("option");
      $(pl).val("").attr({"disabled":"disabled","selected":""}).html(w.content);
      $(sl).append(pl);
      for(var index in w.items){
        var item = w.items[index];
        var li = wiz.make.makeEl("option");
        $(li).addClass("item").val(item.value).html(item.content);
        $(sl).append(li);
      }

      return sl;
    },
    //---------- Make an HTML Element with the tag name and return it -------------------------------------------------------------------
    makeEl :function(el){return document.createElement(el);},
    //---------- Makes the Submit Button and Returns it to WordHandler ------------------------------------------------------------------
    submit:function(w){
      console.info(w);
      submit = wiz.make.makeEl("div");
      $(submit).addClass("btn submit show mgcenter");
      //-------- CALL A VIEW TO SHOW THE RETURNED DATA FROM SERVER ----------------------------------------------------------------------
      theView = wiz.make.view.ofProduct(w.attrs.data);
      
      //-------- ADD THE VIEW TO THE SUBMIT WORD! ---------------------------------------------------------------------------------------
      $(stt).append([theView,submit]);
    },
    //---------- WHEN THE WIZARD STRUCTURE HAS MADE, THIS WILL FIRE and Do Everything needed to be done for interactive purposes --------
    after:function(){
        
      //---------- FOR EACH DROP DOWN MENU ----------------------------------------------------------------------------------------------
      $(".drop").each(function(){
          //------------ If There is no hidden input for it -----------------------------------------------------------------------------
          if($("input[type='hidden'][data-var='"+$(this).attr("name")+"']").size() == 0){
              
            //---------- Making hidden input of variable --------------------------------------------------------------------------------
            var i = wiz.make.makeEl("input");
            $(i).attr({"type":"hidden","name":"var","data-var":this.name,"value":""});
            $(this).parent().parent().append(i);
              
            //---------- Setting the EventHandler - On DropMennu change, update hidden input --------------------------------------------
            $(this).on("change",function(){
                $("[name='var'][data-var='"+$(this).attr('name')+"']").val($(this).val());
                
                //------ Also check if all the statment fields are filled ---------------------------------------------------------------
                wiz.check.allFieldsDone($(this).parent().parent());
            });
          }
      });
      $(".ajaxst").prev().addClass("ajaxnext");
      $(".wizard .statement:first-of-type").addClass("show").removeClass("hide");
    },
    //---------- ANYTHING Related to showing Returning data FROM SERVER in THE WIZARD ---------------------------------------------------
    view:{
        //------ SHOWING Product DATA and Pictures in a VIEW Before PAYING --------------------------------------------------------------
        ofProduct:function(pd){
          v = wiz.make.makeEl("div");
          $.each(pd,function(i,d){
            var tr = wiz.make.makeEl('div');$(tr).addClass("tr");
            var t1 = wiz.make.makeEl('div');$(t1).addClass("td");
            var t2 = wiz.make.makeEl('div');$(t2).addClass("td");
            
            $(t1).html(d.lable); $(t2).html(d.data);
            $(tr).append(t1).append(t2);
            $(v).append(tr);
          });
          $(v).addClass("view show");
            
          return v;
        }
    }
  },
  check:{
    allFieldsDone:function(el){
      // --------------- Assume all the fields of el are filled! ------------------------------------------------------------------------
      var done = true;
        
      // --------------- If not, find it out --------------------------------------------------------------------------------------------
      $(el).children("[name='var']").each(function(){
        done = $(this).val()=="" ? false : done ;
      });
      // --------------- If really done, add the class 'completed' ----------------------------------------------------------------------
      if(done) {
        wiz.classes.completed(el);
        // ------------- And if is 'ajax-next' statement, go for ajax -------------------------------------------------------------------
        if($(el).hasClass("ajaxnext")){
          wiz.live.doAjaxWord(el)
        }
      }
    },
    // --------------- Check if all the statements variables are filled(every data is ready) --------------------------------------------
    // --------------- Checking the 'completed' Class -----------------------------------------------------------------------------------
    isCompleted:function(){
      var allIsDone = 1;
      $(".wizard > span.statement").each(function(){
        if(!$(this).hasClass("completed")) allIsDone=0;
      });
      // ------------- If so, Go for Submiting the Product specs ------------------------------------------------------------------------
      if(allIsDone==1){
        wiz.live.doSubmit();
      }
    }
  },
  // --------------- Some basic things with html attribute class ------------------------------------------------------------------------
  classes:{
    // ------------- Put a 'completed' class for the el element -------------------------------------------------------------------------
    completed:function(el){
      $(el).addClass("completed").next().addClass("show").removeClass("hide");
      wiz.check.isCompleted();
    }
  },
  // --------------- Everything related to interactive tasks need to be done goes here --------------------------------------------------
  live:{
    // ------------- Send all filleded variables to server and get new data -------------------------------------------------------------
    doAjaxWord:function(preEl){
      data = {};
      $("[name='var']").each(function(){
        data[$(this).data("var")]=$(this).val();
      });
      // ----------- Send all the data to server ----------------------------------------------------------------------------------------
      $.post( "http://avrang.ir/newway/v2formdata.php",data, function( newdata ) {
        // --------- Lets add new datas to the wizard -----------------------------------------------------------------------------------
        wiz.live.add(JSON.parse(newdata));
      });
    
    },
    // ------------- Adds new data to the wizard ----------------------------------------------------------------------------------------
    add:function(d){
      // ----------- For each statement of the new data, call Make handleStt to do it ---------------------------------------------------
      $.each(d.statements,function(i,stt){wiz.make.handleStt(stt)});
      // ----------- Show the first statemment after AjaxSt and delete AjaxSt -----------------------------------------------------------
      $(".wizard .statement.ajaxst:first").next().addClass("show").removeClass("hide").prev().remove();
      // ----------- Call Make After to do needed stuf for interactions -----------------------------------------------------------------
      wiz.make.after();

    },
    doSubmit:function(){
        console.log("submiting");
      
    }
  }

}
