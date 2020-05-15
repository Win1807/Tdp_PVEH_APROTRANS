jQuery.sap.require("sap.ui.veh_aprotrans.util.Formatter");
jQuery.sap.require("sap/ui/model/json/JSONModel");
jQuery.sap.require("sap/m/MessageToast");
jQuery.sap.require("sap/m/Table");
// jQuery.sap.require("sap/m/semantic");

sap.ui.define([
   "sap/ui/veh_aprotrans/controller/BaseController",
   "sap/m/MessageBox",
   "sap/ui/model/json/JSONModel",
   "sap/m/Token",
   "sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/veh_aprotrans/util/Formatter"
], function (BaseController, MessageBox, JSONModel, Token, Sorter,Filter,FilterOperator,formatter) {
    "use strict";
    var oView;
    var that;
    var Series = [];
    var ItemsSel = [];
    var oModel;
    var isMobile;
    var DeskinMob;
    var click = 1;
    var clk_m = 1;
	var clk_t = 1;
    var tableuse;
    var tbl;
    var filters;
    var filter;
    var urlGlobal = "/OData_Vehiculos/odata/SAP/ZSCP_VEHICULOS_SRV";
    return BaseController.extend("sap.ui.veh_aprotrans.controller.Home", {
		formatter:formatter,
    	onInit : function () {  
    		
    		 oView = this.getView();
    		 that = this;
    		 oModel = new sap.ui.model.odata.v2.ODataModel(urlGlobal, true);
    		 
	         var oMultiInput1 = oView.byId("serie");
	                  //*** add checkbox validator
	              oMultiInput1.addValidator(function(args){
	                var text = args.text;
	                return new Token({key: text, text: text});
	          });
	          
	            DeskinMob = false;
        	
	            isMobile = sap.ui.Device.system.phone;
	    	    
	    	    oView.byId("tblVisualizarM").getTable().setMode("MultiSelect");
            	oView.byId("tblVisualizarT").getTable().setMode("MultiSelect");
	    	    
	    	    if (isMobile) {
	    	    	tableuse = "tblVisualizarM";
	    	    	that.getView().byId("tblVisualizarT").setVisible(false);
	    	    	that.getView().byId("tblVisualizarM").setVisible(true);
	    	    }
	    	    else {
	    	    	  tableuse = "tblVisualizarT";
	    	    	  that.getView().byId("tblVisualizarT").setVisible(true);
	    	    	  that.getView().byId("tblVisualizarM").setVisible(false);
	    	    	  oView.byId("botonVolver").setVisible(false);
	    	    }
	    	    
	    	    var myModel = this.getOwnerComponent().getModel();
				myModel.setSizeLimit(99999);
	    	    
	    	    oView.byId("btnAnterior").setEnabled(false);
	    	    oView.byId("btnSiguiente").setEnabled(false);
	    	    
	    	    
	          
        },
        
        onNavBack: function(){
            window.history.back();
        },
        
        //Abrir ventana de la busqueda de Serie
		buscaSerie: function() {
			this._oDialog = sap.ui.xmlfragment("diagSerie", "sap.ui.veh_aprotrans.fragment.Serie", this);
			this._oDialog.open();

			var oLModel = new JSONModel(Series);
			var oTable = sap.ui.getCore().byId("diagSerie--tbBusqueda");
			oTable.setModel(oLModel);

			var oMultiInput1 = sap.ui.getCore().byId("diagSerie--codigo");
			//*** add checkbox validator
			oMultiInput1.addValidator(function(args) {
				var text = args.text;

				return new Token({
					key: text,
					text: text
				});
			});
		},
			//Cerrar ventana de la busqueda de Serie
		cancelarBuscarSerie: function() {
			this._oDialog.destroy();
		},
		getItemsSel: function(){
			var items = oView.byId(tableuse).getTable().getSelectedContextPaths();
			var OData = oView.byId(tableuse).getTable().getModel().oData;
			var ItemsRtn = [];
			var obj;
			
			$.each(items, function(index, item) {
				obj = OData[item.toString().replace("/","")];
				
				//Falta datos para probar
				
				/*obj = {
					"LOTE" : obj.Lote,
					"CLIENTE_A" : obj.ClienteA,
					"CLIENTE_B" : obj.ClienteB,
					"FEC_PREFE" : obj.FecPrefe,
					"VALIDODE" : obj.Validode,
					"VALIDOA" : obj.Validoa,
					"USUARIO" : obj.Usuario,
					"STATUS" : obj.Status,
					"STATUST" : obj.Statust,
					"ACTION" : obj.Action,
					"FECHA" : obj.Fecha,
					"HORA" : obj.Hora
				};*/
				
				ItemsRtn.push(obj);
			});
			
			
			
			return ItemsRtn;
				
		},
		
		//Buscar con filtro - Views
		Buscar: function(oEvent){
			// oView.byId("ColVisible1").setVisible(true);
	    	// oView.byId("ColVisible2").setVisible(true);
	    	oView.byId("ColdVis3").setVisible(true);
	    	oView.byId("ColdVis4").setVisible(true);
	    	
			that.getView().byId("tblVisualizarT").rebindTable();
			that.getView().byId("tblVisualizarM").rebindTable();
			
		},
		
		BuscarSerie: function() {
			sap.ui.core.BusyIndicator.show(0); // mostrando la barra de Busy

			var tokenSeries = sap.ui.getCore().byId("diagSerie--codigo").getTokens();
			var material = sap.ui.getCore().byId("diagSerie--material").getValue();
			var descripcion = sap.ui.getCore().byId("diagSerie--descripcion").getValue();
			var nreg = sap.ui.getCore().byId("diagSerie--cantidad").getSelectedKey();
			var PI_SERIE = [];
			var filter = [];
			var filterPar;

			var serieTmp = tokenSeries.map(function(c) {
				return c.getKey();
			});

			// Esctructura de numeros de serie
			$.each(serieTmp, function(index, item) {
				var elemento = {
					'SIGN': 'I',
					'OPTION': "EQ",
					'LOW': item
				};
				PI_SERIE.push(elemento);
			});

			// Esctructura de materiales
			if (material != "") {
				var PI_MATNR = [{
					'SIGN': 'I',
					'OPTION': "EQ",
					'LOW': material
				}];
			} else {
				var PI_MATNR = [];
			}

			// Estructura a enviar en servicio
			var datos = {
				'|PI_MAKTX': descripcion,
				'|PI_NREG': nreg,
				'|PI_SERIE': PI_SERIE,
				'|PI_MATNR': PI_MATNR
			};
			
			console.log(datos);
			
			filterPar = new sap.ui.model.Filter("Parametros", sap.ui.model.FilterOperator.EQ, JSON.stringify(datos));
			filter.push(filterPar);
			
			var filterId = new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, "06");
            filter.push(filterId);
            
            console.log(filter);
            
			//EntitySet es el entityset del metadata 
			oModel.read("/PRC_VEHICULOSSet" ,{
				filters: filter,
				success: function(result, status, xhr){
					var rpta = JSON.parse(result.results[0].Json);
					
					console.log(rpta);
					
					var oLocalModel = new JSONModel(rpta);
					var oTable = sap.ui.getCore().byId("diagSerie--tbBusqueda");
					oTable.setModel(oLocalModel);
						
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(error){
					console.log(error);
					sap.ui.core.BusyIndicator.hide();
				},
				urlParameters: {
                    search: "POST"
                }

			});
		},
			//Seleccionar serie de la búsqueda
		seleccionarSerie: function() {
			var oTable = sap.ui.getCore().byId("diagSerie--tbBusqueda");
			var tokenTmp = [];
			var contexts = oTable.getSelectedContexts();
			
			if (contexts.lenght != 0) {
				var items = contexts.map(function(c) {
					return c.getObject();
				});

				var oMultiInput1 = oView.byId("serie");

				// Agregar nuevas tokens. Si se quiere reemplaza, utilizar setTokens
				//tokenTmp.push(new Token({text: item.qmtxt, key: item.qmart}));

				$.each(items, function(index, item) {
					oMultiInput1.addToken(new Token({
						text: parseInt(item.vhcle),
						key: parseInt(item.vhcle)
					}));
				});

				this._oDialog.destroy();
			} else {
				sap.m.MessageBox.error("Debe seleccionar por lo menos una serie");
			}
		},
		onBeforeTBL: function(oEvent) {
			sap.ui.core.BusyIndicator.show();
			var aFilter = [];
			var tokenSeries = oView.byId("serie").getTokens();
			var fechaI = oView.byId("fechaini").getValue();
			var fechaF = oView.byId("fechafin").getValue();

			/*var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1;
			var yyyy = today.getFullYear();

			if (dd < 10) {
				dd = '0' + dd;
			}

			if (mm < 10) {
				mm = '0' + mm;
			}

			var first = yyyy + "-" + mm + "-01";
			today = yyyy + "-" + mm + "-" + dd;

		

			if (fechaI == "") {
				oView.byId("fechaini").setValue(first);
				fechaI = first;
			}
			if (fechaF == "") {
				oView.byId("fechafin").setValue(today);
				fechaF = today;
			}

			*/

			if (fechaI != "" && fechaF != "") {
				
				var currentFormattedDate1 = new Date(fechaI + " 00:00");
				var currentFormattedDate2 = new Date(fechaF + " 00:00");
				
				aFilter.push(
					new Filter("Fecha", FilterOperator.BT, currentFormattedDate1, currentFormattedDate2)
				);
			}
			
			//Lote
		/*	aFilter.push(
				new Filter("Doctip", FilterOperator.EQ, tipoDoc)
			);*/

			var serieTmp = tokenSeries.map(function(c) {
				return c.getKey();
			});

			// Esctructura de numeros de serie
			$.each(serieTmp, function(index, item) {
				aFilter.push(
					new Filter("Lote", FilterOperator.EQ, item)
				);
			});

			console.log(aFilter);

			oEvent.mParameters.bindingParams.filters = aFilter;
		},
		onLoadM: function(oEvent){ //Evento se activa cuando trae data el smart table mobile
				sap.ui.core.BusyIndicator.hide();
				
				oView.byId("ColdVis3").setVisible(false);
	    		oView.byId("ColdVis4").setVisible(false);
	    		
        		var tblcant = oView.byId(tableuse).getTable().getItems().length;
        	
	        	if(tblcant == 0){
	        		
	        		oView.byId("btnSiguiente").setEnabled(false);
	        		oView.byId("btnAnterior").setEnabled(false);
	        		
	        	}else{
	        		
	        		oView.byId("btnSiguiente").setEnabled(true);
	        		oView.byId("btnAnterior").setEnabled(true);
	        		
	        	}
	        	
	        	this.goTo(click);
	        	
	        	if(click == 1) oView.byId("btnAnterior").setEnabled(false);
	        	else oView.byId("btnAnterior").setEnabled(true);
	        /*	this.goTo(click);
	        	
	        	if(click == 1) oView.byId("btnAnterior").setEnabled(false);
	        	else oView.byId("btnAnterior").setEnabled(true);*/
	        	
        },
        
        onLoadT: function(oEvent){ //Evento se activa cuando trae data el smart table desktop
        
        		sap.ui.core.BusyIndicator.hide();
        		// oView.byId("ColVisible1").setVisible(false);
	    		// oView.byId("ColVisible2").setVisible(false);
        		
        		var tblcant = oView.byId(tableuse).getTable().getItems().length;
        	
	        	if(tblcant == 0){
	        		
	        		oView.byId("btnSiguiente").setEnabled(false);
	        		oView.byId("btnAnterior").setEnabled(false);
	        		
	        	}else{
	        		
	        		oView.byId("btnSiguiente").setEnabled(true);
	        		oView.byId("btnAnterior").setEnabled(true);
	        		
	        	}
	        	
	        	this.goTo(click);
	        	
	        	if(click == 1) oView.byId("btnAnterior").setEnabled(false);
	        	else oView.byId("btnAnterior").setEnabled(true);
	        	/*this.goTo(click);
	        	
	        	if(click == 1) oView.byId("btnAnterior").setEnabled(false);
	        	else oView.byId("btnAnterior").setEnabled(true);*/
	       
        },
        onPressItem: function(){
        	
           tableuse = "tblVisualizarT";
           
           oView.byId("tblVisualizarT").setVisible(true);
       	   oView.byId("botonVolver").setVisible(true);
           oView.byId("tblVisualizarM").setVisible(false);
           
           click = clk_t;
           this.goTo(click);
           
           if(click == 1) oView.byId("btnAnterior").setEnabled(false);
           else oView.byId("btnAnterior").setEnabled(true);
           
           DeskinMob = true;
        },
        onVolver: function(){
        	
           tableuse = "tblVisualizarM";
           
           oView.byId("tblVisualizarT").setVisible(false);
       	   oView.byId("botonVolver").setVisible(false);
           oView.byId("tblVisualizarM").setVisible(true);
           
           click = clk_m;
           this.goTo(click);
           
           if(click == 1) oView.byId("btnAnterior").setEnabled(false);
           else oView.byId("btnAnterior").setEnabled(true);
	       
	       DeskinMob = false;
        },
        
        onShow: function(oEvent){
        	
        	click = 1;
        	this.goTo(click);
        	
        },
        //Paginación
		  range: function(oInit, oEnd, oData){
           var tmp=[];            
           /*var oTable = this.oData().oData;*/

           $.each(oData, function(key, item){
               var sId = item.sId;
               if(key >= oInit && key <= oEnd){
                   /*tmp.push(item);*/
                   sap.ui.getCore().byId(sId).setVisible(true);
               }else{                    
                   sap.ui.getCore().byId(sId).setVisible(false);
               }
               /*return;*/
           });
           /*return tmp;*/
        },
        
        goTo: function(oClick){
        	
           var oSelectItem = oView.byId("sShow").getSelectedKey();
           var oTable =  oView.byId(tableuse).getTable().getItems();
           var oTotal = oTable.length;
           var oShow = Math.ceil(oTotal / oSelectItem);
           
           if(oClick <= oShow){
           	
               if(oShow == oClick){
                  oView.byId("btnSiguiente").setEnabled(false);
               }else{
                  oView.byId("btnSiguiente").setEnabled(true);
               }
               
               this.range(oSelectItem * (oClick - 1), (oSelectItem * oClick) - 1, oTable);
           }
           
           if(oClick <= 1){
           		oView.byId("btnAnterior").setEnabled(false);
           }    
           
        },
        goNext: function(){
        	
            this.goTo(click += 1); 
            
            if(tableuse == "tblVisualizarM") clk_m = click;
            else clk_t = click;
            
            if(click != 0){
                oView.byId("btnAnterior").setEnabled(true);
            }else{
                oView.byId("btnAnterior").setEnabled(false);
            }
            
        },
        goPrevious: function(){
        	
            this.goTo(click -= 1);
            
            if(tableuse == "tblVisualizarM") clk_m = click;
            else clk_t = click;
            
            if(click <= 1){
                oView.byId("btnAnterior").setEnabled(false);
            }else{
                oView.byId("btnAnterior").setEnabled(true);
            }
            
        },
        OnAccept: function(oEvent){
        	 
        	var datasend = "";
        	
        	tbl = oView.byId(tableuse).getTable();         
        	ItemsSel = that.getItemsSel();
        	
        	if(ItemsSel.length == 0){
                sap.m.MessageBox.error("Debe seleccionar uno o más registros de la tabla");
                return;
            }
        	
        	MessageBox.confirm("¿Confirma que desea aprobar la transferencia?", {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                title: "Aprobar transferencia",
                onClose: function (oAction) {
                    switch (oAction) {
                        case 'YES':
							that.onAction(ItemsSel, "X");
                        	break;
                    }
                }
            });
        	
        	
        },
        onDecline: function(oEvent){
        	
        	var datasend = "";
        	
        	tbl = oView.byId(tableuse).getTable();         
        	ItemsSel = that.getItemsSel();
        	
        	if(ItemsSel.length == 0){
                sap.m.MessageBox.error("Debe seleccionar uno o más registros de la tabla");
                return;
            }
        	
        	MessageBox.confirm("¿Confirma que desea rechazar la transferencia?", {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                title: "Rechazar transferencia",
                onClose: function (oAction) {
                    switch (oAction) {
                        case 'YES':
                        	
							that.onAction(ItemsSel, " ");
                        	
                        	break;
                    }
                }
            });
        	
        },
        onAction: function(oDataSend, isAprove) {
        	
        	sap.ui.core.BusyIndicator.show();
            
            filters = [];
            
            filter = new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, "27");
            
            filters.push(filter);
            
            filter = new sap.ui.model.Filter("Data", sap.ui.model.FilterOperator.EQ, JSON.stringify(ItemsSel));
            
            filters.push(filter);

            filter = new sap.ui.model.Filter("Parametros", sap.ui.model.FilterOperator.EQ, isAprove);
            
            filters.push(filter);
            
			oModel.read("/PRC_VEHICULOSSet", 
                {
	                filters: filters,
					urlParameters: {
	                    search: "GET"
	                },
	                success: function (result, status, xhr) {
	                	
	                	result = JSON.parse(result.results[0].Json);
	                	
	                	console.log(result);
	                	
	                	MessageBox.information(result[0].message);
	                	
	                	/*if(result[0].type === undefined){
		                    var oModelJson = new sap.ui.model.json.JSONModel(result);
		                    sap.ui.getCore().byId("xmlFilterMaterial--tbFilterMaterial").setModel(oModelJson);
	                	}else{
	                		MessageBox.information(result[0].message);
	                    	sap.ui.getCore().byId("xmlFilterMaterial--tbFilterMaterial").setModel(new JSONModel());
	                	}*/
	                	that.Buscar();
	                	sap.ui.core.BusyIndicator.hide();
	                },
	                error: function (xhr, status, error) {
	                    sap.ui.core.BusyIndicator.hide();
	                    MessageBox.error(xhr.statusText);
	                }
	                
            	});
        	
        	
        }
        
    });
});
