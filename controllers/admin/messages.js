var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var fs = require('fs');
var path = require('path');
var helpers = require('../../helpers/helpers');
var _ = require('underscore');

const passportConfig = require('../../config/passport'),
      Conversation = require('../../models/Conversation'),
      Message = require('../../models/Message'),
      User = require('../../models/User'),
      Jobs = require('../../models/Jobs');


router.get('/', passportConfig.isAuthenticated, function(req, res, next){

    if(req.user.type == "candidate"){
        Conversation.find({ participants: { "$in" : [req.user._id]} })
          .sort('+lastMessageTimeStamp')
          .exec(function(err, conversations) {
            if (err) {
              res.send({ error: err });
              return next(err);
            }

            if(conversations && conversations.length > 0){
                // Set up empty array to hold conversations + most recent message
                let fullConversations = [];
                conversations.forEach(function(conversation) {
                    if(conversation.participants[0].toString() == req.user._id.toString()){
                        var participantId = conversation.participants[1]
                    }
                    if(conversation.participants[1].toString() == req.user._id.toString()){
                        var participantId = conversation.participants[0];
                    }

                    User.find({'_id' : participantId }, function(err, participant){

                        Message.find({ 'conversationId': conversation._id })
                            .sort('-createdAt')
                            .limit(1)
                            .populate({
                            path: "author",
                            select: "profile"
                        })
                        .exec(function(err, message) {
                            if (err) {
                            res.send({ error: err });
                            return next(err);
                        }
                        message[0].participantName = participant[0].profile.name;
                        fullConversations.push(message);

                        if(fullConversations.length === conversations.length) {

                            if(req.user.type == "candidate"){
                                var template = 'admin/candidate-home';
                            }else var template = 'admin/recruiter/messages';

                            fullConversations = _.sortBy(fullConversations, function(o) { return o[0].createdAt }).reverse();
                            res.render(template, {
                            	title: 'Messages',
                            	pageName: 'Messages',
                                conversations : fullConversations,
                                tab: 'messages'
                            })

                        }
                        });

                    });

                });
            }
            else{

                Jobs.find({userId: req.user.id}, function(err, result){
                    if(result){
                        let openjobs = [];
                        openjobs = result.filter(function(m){
                            return m.jobStatus == true;
                        });

                        let selectedJob = [];
                        selectedJob = result.filter(function(p){
                            return p._id == req.params.id
                        });

                        let dataArray = [];
                            dataArray = result.filter(function(n){
                            return n._id == req.params.jobId
                        });

                        if(req.user.type == "candidate"){
                            var template = 'admin/candidate-home';
                        }else var template = 'admin/recruiter/messages';


                        res.render(template, { //
                            title: 'Messages',
                            pageName: 'Messages',
                            tab: 'messages',
                            selectedJob: selectedJob[0],
                            data: selectedJob[0],
                            jobData: openjobs,
                            conversations: [],
                            message: "No conversations found",
                            data: dataArray[0]
                        })
                    }
                });

            }

        });
    }
    else{

        // Same as job with id just with a change in conversation mongo query below
        Conversation.find({ participants: {"$in" : [req.user._id]} })
          .exec(function(err, conversations) {
            if (err) {
              res.send({ error: err });
              return next(err);
            }

            if(conversations.length > 0){
                // Set up empty array to hold conversations + most recent message
                let fullConversations = [];
                conversations.forEach(function(conversation) {
                    if(conversation.participants[0].toString() == req.user._id.toString()){
                        var participantId = conversation.participants[1]
                    }
                    if(conversation.participants[1].toString() == req.user._id.toString()){
                        var participantId = conversation.participants[0];
                    }

                    User.find({'_id' : participantId }, function(err, participant){

                        Message.find({ 'conversationId': conversation._id })
                            .sort('-createdAt')
                            .limit(1)
                            .populate({
                            path: "author",
                            select: "profile"
                        })
                        .exec(function(err, message) {
                            if (err) {
                            res.send({ error: err });
                            return next(err);
                        }
                        message[0].participantName = participant[0].profile.name;
                        fullConversations.push(message);
                        if(fullConversations.length === conversations.length) {

                            if(req.user.type == "candidate"){
                                var template = 'admin/candidate-home';
                            }else var template = 'admin/recruiter/messages';

                            Jobs.find({userId: req.user.id}, function(err, result){
                                if(result){
                                    let openjobs = [];
                                    openjobs = result.filter(function(m){
                                        return m.jobStatus == true;
                                    });

                                    let selectedJob = [];
    						        selectedJob = result.filter(function(p){
    							        return p._id == req.params.jobId
    						        });
                                    let dataArray = [];
    						            dataArray = result.filter(function(n){
    							        return n._id == req.params.jobId
    						        });

                                    fullConversations = _.sortBy(fullConversations, function(o) { return o[0].createdAt }).reverse();
                                    //console.log(fullConversations);
                                    res.render(template, {
                                    	title: 'Messages',
                                    	pageName: 'Messages',
                                        conversations : fullConversations,
                                        tab: 'messages',
                                        jobData: openjobs,
                                        selectedJob: selectedJob[0],
                                        data: dataArray[0]
                                    });
                                }
                            });

                        }
                        });

                    });

                });
            }
            else{

                Jobs.find({userId: req.user.id}, function(err, result){
                    if(result){

                        let openjobs = [];
                        openjobs = result.filter(function(m){
                            return m.jobStatus == true;
                        });

                        let selectedJob = [];
                        selectedJob = result.filter(function(p){
                            return p._id == req.params.jobId
                        });

                        let dataArray = [];
                            dataArray = result.filter(function(n){
                            return n._id == req.params.jobId
                        });

                        if(req.user.type == "candidate"){
                            var template = 'admin/candidate-home';
                        }else var template = 'admin/recruiter/messages';
                        //console.log(openjobs)
                        res.render(template, {
                            title: 'Messages',
                            pageName: 'Messages',
                            tab: 'messages',
                            jobData: openjobs,
                            selectedJob: selectedJob[0],
                            conversations: [],
                            message: "No conversations found",
                            selectedJob: selectedJob,
                            data: dataArray[0]
                        })
                    }
                });

            }

        });

    }
});

router.get('/:jobId', passportConfig.isAuthenticated, function(req, res, next){
    Conversation.find({ participants: {"$in" : [req.user._id]}, jobId:req.params.jobId })
      .exec(function(err, conversations) {
        if (err) {
          res.send({ error: err });
          return next(err);
        }

        if(conversations.length > 0){
            // Set up empty array to hold conversations + most recent message
            let fullConversations = [];
            conversations.forEach(function(conversation) {
                if(conversation.participants[0].toString() == req.user._id.toString()){
                    var participantId = conversation.participants[1]
                }
                if(conversation.participants[1].toString() == req.user._id.toString()){
                    var participantId = conversation.participants[0];
                }

                User.find({'_id' : participantId }, function(err, participant){

                    Message.find({ 'conversationId': conversation._id })
                        .sort('-createdAt')
                        .limit(1)
                        .populate({
                        path: "author",
                        select: "profile"
                    })
                    .exec(function(err, message) {
                        if (err) {
                        res.send({ error: err });
                        return next(err);
                    }
                    message[0].participantName = participant[0].profile.name;
                    message[0].participantId = participantId;
                    fullConversations.push(message);
                    if(fullConversations.length === conversations.length) {

                        if(req.user.type == "candidate"){
                            var template = 'admin/candidate-home';
                        }else var template = 'admin/recruiter/messages';

                        Jobs.find({userId: req.user.id}, function(err, result){
                            if(result){
                                let openjobs = [];
                                openjobs = result.filter(function(m){
                                    return m.jobStatus == true;
                                });

                                let selectedJob = [];
						        selectedJob = result.filter(function(p){
							        return p._id == req.params.jobId
						        });
                                let dataArray = [];
						            dataArray = result.filter(function(n){
							        return n._id == req.params.jobId
						        });

                                //console.log(result);
                                // only them saved from the job
                                // fullConversations = fullConversations.filter(function(n){
                                //     //console.log(n);
                                //     return true;
                                // })

                                //console.log(req.p)
                                Jobs.findOne({_id: req.params.jobId}, function(err, job){
                                    if (err) {
                                        res.send({ error: err });
                                        return next(err);
                                    }
                                    else{

                                        var savedCandidatesToShowArray = job.candidateId;
                                        fullConversations = _.filter(fullConversations, function(n){
                                            return _.contains(savedCandidatesToShowArray, n[0].participantId.toString());
                                        });

                                        fullConversations = _.sortBy(fullConversations, function(o) { return o[0].createdAt }).reverse();
                                        if(fullConversations.length > 0){
                                            res.render(template, {
                                                title: 'Messages',
                                                pageName: 'Messages',
                                                conversations : fullConversations,
                                                tab: 'messages',
                                                jobData: openjobs,
                                                selectedJob: selectedJob[0],
                                                data: dataArray[0]
                                            });
                                        }
                                        else{

                                            res.render(template, {
                                                title: 'Messages',
                                                pageName: 'Messages',
                                                tab: 'messages',
                                                jobData: openjobs,
                                                selectedJob: selectedJob[0],
                                                conversations: [],
                                                message: "No conversations found for this job.",
                                                selectedJob: selectedJob,
                                                data: dataArray[0]
                                            })
                                        }
                                    }
                                })


                            }
                        });

                    }
                    });

                });

            });
        }
        else{

            Jobs.find({userId: req.user.id}, function(err, result){
                if(result){

                    let openjobs = [];
                    openjobs = result.filter(function(m){
                        return m.jobStatus == true;
                    });

                    let selectedJob = [];
                    selectedJob = result.filter(function(p){
                        return p._id == req.params.jobId
                    });

                    let dataArray = [];
                        dataArray = result.filter(function(n){
                        return n._id == req.params.jobId
                    });

                    if(req.user.type == "candidate"){
                        var template = 'admin/candidate-home';
                    }else var template = 'admin/recruiter/messages';
                    //console.log(openjobs)
                    res.render(template, {
                        title: 'Messages',
                        pageName: 'Messages',
                        tab: 'messages',
                        jobData: openjobs,
                        selectedJob: selectedJob[0],
                        conversations: [],
                        message: "No conversations found",
                        selectedJob: selectedJob,
                        data: dataArray[0]
                    })
                }
            });

        }

    });
});


// Retrieve single conversation
router.get('/conversation/:conversationId', passportConfig.isAuthenticated, function(req, res, next){

    Message.find({ conversationId: req.params.conversationId })
        .select('createdAt body author')
        .sort('+createdAt')
        .populate({
          path: 'author',
          select: 'profile'
        })
        .exec(function(err, messages) {
          if (err) {
            res.send({ error: err });
            return next(err);
          }

          var fileData = fs.readFileSync(path.join(__dirname, '../../views/admin/partials/messages-list.ejs')).toString();
          var html = ejs.render(fileData, {
                  data: messages,
                  userId: req.user._id,
                  helpers: helpers
          });
          res.send(html);

        });

 });

// Start new conversation
router.post('/new/:jobId/:recipient/', function(req, res, next){
    if(!req.params.recipient) {
        res.status(422).send({ error: 'Please choose a valid recipient for your message.' });
        return next();
    }

    if(!req.body.composedMessage) {
        res.status(422).send({ error: 'Please enter a message.' });
        return next();
    }

    Conversation.findOne({ participants: { $all: [req.user._id, req.params.recipient] }})
    .exec(function(err, result) {
        if (err) {
            res.send({ error: err });
            return next(err);
        }
        //console.log(result);
        if(!result){
            const conversation = new Conversation({
                participants: [req.user._id, req.params.recipient],
                jobId: [req.params.jobId]
            });
            conversation.save(function(err, newConversation) {
                if (err) {
                  res.send({ error: err });
                  return next(err);
                }
                saveMessage(newConversation._id, req.body.composedMessage, req.user._id, function(err, newMessage){
                    if (err) {
                        res.send({ error: err });
                        return next(err);
                    }
                    res.status(200).json({ message: 'Conversation started!', conversationId: conversation._id });
                    return next();
                });
            });
        }
        else{

            var match = false;
            var contains = _.filter(result.jobId, function (r) {
                if(r.toString() === req.params.jobId.toString()){
                    match = true;
                }
            });

            if(!match){
                Conversation.update({_id: result._id },{$push: { 'jobId' : req.params.jobId }},
                    function(err, data) {
                        if (err) {
                            res.send({ error: err });
                            return next(err);
                        }
                    });
            }

            saveMessage(result._id, req.body.composedMessage, req.user._id, function(err, newMessage){
                if (err) {
                    res.send({ error: err });
                    return next(err);
                }
                res.status(200).json({ message: 'Conversation started!' });
                return next();
            });

        }

    });

});

function saveMessage(conversationId, message, authorId, cb){

      Conversation.findOne({ _id: conversationId }, function(err, c) {
            //console.log(c);
            if (err) {
              res.send({ error: err});
              return next(err);
            }
            if(c){
                //if(c.jobId == )
                c.lastMessageAuthor = authorId;
                c.lastMessage = message;
                c.lastMessageTimeStamp = new Date();
                c.save(function (err, updatedConversation) {
                  if (err) {
                    res.send({ error: err });
                    return next(err);
                  }
                      const createMessage = new Message({
                          conversationId: conversationId,
                          body: message,
                          author: authorId
                      });
                      createMessage.save(function(err, newMessage){
                          cb(err, newMessage);
                      });
                });
            }
            else{
                cb(err='No coversation found')
            }
      });

}

// Send reply in conversation
router.post('/:conversationId', passportConfig.isAuthenticated, function(req, res, next){

    saveMessage(req.params.conversationId, req.body.composedMessage, req.user._id, function(err, sentReply){
        if (err) {
            res.send({ error: err });
            return next(err);
        }
        res.status(200).json({ message: 'Reply successfully sent!' });
        return(next);
    });

});


// DELETE Route to Delete Conversation
// exports.deleteConversation = function(req, res, next) {
//   Conversation.findOneAndRemove({
//     $and : [
//             { '_id': req.params.conversationId }, { 'participants': req.user._id }
//            ]}, function(err) {
//         if (err) {
//           res.send({ error: err });
//           return next(err);
//         }
//
//         res.status(200).json({ message: 'Conversation removed!' });
//         return next();
//   });
// }

// PUT Route to Update Message
// exports.updateMessage = function(req, res, next) {
//   Conversation.find({
//     $and : [
//             { '_id': req.params.messageId }, { 'author': req.user._id }
//           ]}, function(err, message) {
//         if (err) {
//           res.send({ error: err});
//           return next(err);
//         }
//
//         message.body = req.body.composedMessage;
//
//         message.save(function (err, updatedMessage) {
//           if (err) {
//             res.send({ error: err });
//             return next(err);
//           }
//
//           res.status(200).json({ message: 'Message updated!' });
//           return next();
//         });
//   });
// }

module.exports = router;
