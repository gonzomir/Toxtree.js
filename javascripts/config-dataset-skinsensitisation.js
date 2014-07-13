var config_dataset = {
		/*
	"fnAccumulate": function(fId, oldVal, newVal, features) {
		if (
			features[fId].sameAs == "http://www.opentox.org/echaEndpoints.owl#Carcinogenicity" ||
			features[fId].sameAs == "http://www.wikipathways.org/index.php/Pathway"				
			) {
			if ((oldVal === undefined) || (oldVal == null) || ("" == oldVal)) oldVal = [];
		    if ((newVal === undefined) || ccLib.isNull(newVal)) return oldVal;

		    newVal = {"feature" : fId,  "value" : newVal };

		    if ($.inArray(newVal,oldVal)==-1)
		          oldVal.push(newVal);
	
		    return oldVal;
		} else {
				
		      if (ccLib.isNull(newVal))
		          return oldVal;
		        newVal = newVal.toString();
		        if (ccLib.isNull(oldVal) || newVal.toLowerCase().indexOf(oldVal.toLowerCase()) >= 0)
		          return newVal;
		        if (oldVal.toLowerCase().indexOf(newVal.toLowerCase()) >= 0)
		          return oldVal;
		        return oldVal + ", " + newVal;			
		}
	},		
	*/
	
	"configuration": {
	   "baseFeatures": {
	        "http://www.opentox.org/api/1.1#Diagram": {
	        	"used" : true,	
	            "title" : "Image",
	            "render" : function(col) {
	                col["bVisible"] = false;
	                col["sClass"] = "paddingless";
	                col["sWidth"] = "64px";
	                return col;
	            }
	        },
	        "http://www.opentox.org/api/1.1#CASRN" : {
		    	"used" : true,	
					"render" : function(col) {
			          	    col["bVisible"] = false;
			                return col;
			            }    		
		    },	        
		    "http://www.opentox.org/api/1.1#EINECS" : {
		    	"used" : true,	
					"render" : function(col) {
			          	    col["bVisible"] = false;
			                return col;
			            }    		
		    },	    
		    "http://www.opentox.org/api/1.1#IUPACName" : {
		    	"used" : true,	
					"render" : function(col) {
			          	    col["bVisible"] = false;
			                return col;
			            }    		
		    },	        
		    "http://www.opentox.org/api/1.1#SMILES" : {
		    	"used" : true,	
					"render" : function(col) {
			          	    col["bVisible"] = false;
			                return col;
			            }    		
		    },	        
		    "http://www.opentox.org/api/1.1#InChIKey" : {
		    	"used" : true,	
					"render" : function(col) {
			          	    col["bVisible"] = false;
			                return col;
			            }    		
		    },	        
		    "http://www.opentox.org/api/1.1#InChI" : {
		    	"used" : true,	
					"render" : function(col) {
			          	    col["bVisible"] = false;
			                return col;
			            }    		
		    },	        
		    "http://www.opentox.org/api/1.1#REACHRegistrationDate" : {
		    	"used" : true,	
					"render" : function(col) {
			          	    col["bVisible"] = false;
			                return col;
			            }    		
		    },
		    "http://www.opentox.org/api/1.1#TradeName" : {
		    	"title" : "Name"
		    },
	        "http://www.opentox.org/api/1.1#IUCLID5_UUID" : {
	        	"title" : "UUID"
		    }				    
	    

	    },
	    "groups": {
	          "Identifiers" : [
	             "http://www.opentox.org/api/1.1#IUCLID5_UUID"
 
	          ],
	          "Names": [
	                    "http://www.opentox.org/api/1.1#ChemicalName",
	                    "http://www.opentox.org/api/1.1#TradeName"
 		  ]
        }
	}    
}