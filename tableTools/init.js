var fs = require("fs");

// 异步读取
fs.readFile('./table/user.tb', function (err, data) {
   if (err) {
       return console.error(err);
   }
   creatTable(data.toString());
});
function creatTable(tbData)   
{     
	var str="";
	var tbArr=tbData.split('\r\n');
	var isMultiComment=false;
	var single='//';
	var multi_start='/*';
	var multi_end='*/';
	var itemArr=[];
	var index_s=0;
	var index_ms=0; 
	var index_me=0;
	var subStr;
	for(var i=0;i<tbArr.length;++i)
	{
		if(tbArr[i].length==0){
			continue;
		}
		if(isMultiComment==false)
		{
			index_s=tbArr[i].indexOf(single);
			index_ms=tbArr[i].indexOf(multi_start);
			index_me=tbArr[i].indexOf(multi_end);
			if(index_ms>=0)//多行注释符号存在
			{
				if(index_s>=0 && index_s<index_ms)//单行注释符号存在 在多行注释符号前面
				{
					pushItemArr(tbArr[i].slice(0,index_s));
				}
				else
				{
					if(index_me>0)
					{
						isMultiComment=false;

						tbArr[i]=tbArr[i].slice(0,index_ms)+tbArr[i].slice(index_me+multi_end.length,tbArr[i].length)
						--i;
					}
					else
					{
						pushItemArr(tbArr[i].slice(0,index_ms));
						isMultiComment=true;
					}
					
				}
			}
			else//单行注释
			{
				if(index_s<0)
				{
					pushItemArr(tbArr[i]);
				}
				else
				{
					pushItemArr(tbArr[i].slice(0,index_s));
				}
			}	
		}
		else
		{
			index_me=tbArr[i].indexOf(multi_end);
			if(index_me>=0)
			{
				isMultiComment=false;
				tbArr[i]=tbArr[i].slice(index_me+multi_end.length,tbArr[i].length)
				--i;
			}
		}
	}
	function pushItemArr(str)
	{
		var tempArr=str.split(";");
		for(var i=0;i<tempArr.length;++i)
		{
			if(tempArr[i].length>0)
			{
				try{
					itemArr.push(JSON.parse(tempArr[i]));
				}
				catch(e)
				{
					console.error(e);
					console.log(tempArr[i]);
				}
				
			}
		}	
	}
	var tableName;
	var key;
	var colArr=[];
	for(var i=0;i<itemArr.length;++i)
	{
		if(itemArr[i]['dbname'])
		{
			tableName=itemArr[i]['dbname'];
		}
		else if(itemArr[i]['key'])
		{
			key=itemArr[i]['key'];
		}
		else if(itemArr[i]['col'])
		{
			colArr.push(itemArr[i]['col'])
		}
	}
	var sql="",name,type,val;
	sql+="CREATE TABLE If Not Exists `"+tableName+"` (";
	sql+="`"+key+"` int(11) NOT NULL AUTO_INCREMENT,PRIMARY KEY (`"+key+"`)";

	for(var i=0;i<colArr.length;++i)
	{
		name=colArr[i][0];
		type=colArr[i][1];
		val=colArr[i][2];
		switch(type)
		{
			case 'int':
				sql+=",`"+name+"` int(11) DEFAULT '"+val+"'";
				break;
			case 'varchar':
				if(val.length==0)
				{
					val='""';
				}
				else if(val!="NULL")
				{
					val='"'+val+'"';
				}
				sql+=",`"+name+"` varchar(255) DEFAULT "+val;
				break;
			case 'datetime':
				sql+=",`"+name+"` datetime DEFAULT NULL";
				break;
			case 'text':
				sql+=",`"+name+"` text";
				break;
		}
	}	
	sql+=") ENGINE=InnoDB DEFAULT CHARSET=utf8;";
	console.log(sql);
    //return str;
}