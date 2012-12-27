enyo.kind({
    name:"cit.LoadingPopup",
    kind:"onyx.Popup",
    classes:"loading-popup",
    centered:true,
    floating:true,
    modal:true,
    scrim:true,
    autoDismiss:false,
    events:{
        onRetry:""
    },
    handlers:{
        onShow:"showMe"
    },
    components:[
        {name:"spinner", kind:"onyx.Spinner", classes:"onyx-light"},
        {name:"message", content:"Loading gift lists ...", style:"font-style:italic;"},
        {name:"retry", kind:"onyx.Button", content:"Retry", classes:"retry", showing:false, ontap:"retryTapped"}
    ],
    showMe:function() {
        this.$.message.show()
        this.$.retry.hide();
    },
    retry:function() {
        this.$.message.hide();
        this.$.retry.show();
    },
    retryTapped:function() {
        this.doRetry();
    }
});