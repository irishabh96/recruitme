const moment = require('moment');
const _ = require('underscore');

function agoTime(v){
   return moment(v).fromNow();
}
exports.agoTime = agoTime;


function sortTime(result){
    result = result.toObject();
    var data = result.map(function(item) {
        if(item.isCurrent){
            item.sortTime = new Date();
        }else{
            if(item.time.endYear && item.time.endMonth){
                item.sortTime = moment(item.time.endYear+' '+item.time.endMonth+ ' 15', 'YYYY MMM DD').toDate();
            }
        }
        return item;
    });
    data = _.sortBy(data, function(o) { return o.sortTime;}).reverse();    
    return data;
}
exports.sortTime = sortTime;


// result = result.toObject();
// result.experience = result.experience.map(function(item) {
//     if(item.isCurrent){
//         item.sortTime = new Date();
//     }else{
//         if(item.time.endYear && item.time.endMonth){
//             item.sortTime = moment(item.time.endYear+' '+item.time.endMonth+ ' 15', 'YYYY MMM DD').toDate();
//         }
//     }
//     return item;
// });
// result.experience = _.sortBy(result.experience, function(o) { return o.sortTime; });
