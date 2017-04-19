<div>
<form id="formID" action="/profile/experience/edit/{{data._id}}" method="post">
    <input type="hidden" name="_csrf" value="<%- _csrf %>">
    <input type="text" style="width:100% ; margin:0px 0px 0px 0px; border:white ; -webkit-appearance:none" placeholder="Enter Company Name" id="name" name="name" value="{{data.companyName}}"></input><br>
    <l>(</l>

    <select id="startMonth" style="width:auto ; margin:0px 0px 0px 0px; border:white ; -webkit-appearance:none"  name="startMonth">
        <option>Start Month</option>
            <% config.monthsList.forEach(function(item,index){ %>
        <option><%- item %></option>
        <% }) %>
    </select>
    <select class="" id="startYear"  style="width:auto ; margin:0px 0px 0px 0px; border:white ; -webkit-appearance:none"  name="startYear">
        <option>Start Year</option>
        <% for(i=config.years.upto; i>=config.years.from; i--){ %>
            <option><%- i %></option>
        <% } %>
    </select>
    &nbsp; - &nbsp;
    <select class="" id="endMonth" style="width:auto ; margin:0px 0px 0px 0px; border:white ; -webkit-appearance:none"  name="endMonth">
        <option>End Month</option>
        <% config.monthsList.forEach(function(item,index){ %>
            <option><%- item %></option>
        <% }); %>
    </select>
    <select  id="endYear" style="width:auto ; margin:0px 0px 0px 0px; border:white ; -webkit-appearance:none"  name="endYear">
        <option>End Year</option>
        <% for(i=config.years.upto; i>=config.years.from; i--){ %>
            <option><%- i %></option>
        <% } %>
    </select>
    <l>)</l>
    <br>
    <input type="text" style="width:100% ; margin:0px 0px 0px 0px; border:white ; -webkit-appearance:none" placeholder="Enter Position Title" name="title" id="title" value="{{data.title}}" ></input>


    <button id="addbutt" class="saveBtn" style="left: 116%;top:1%;position: absolute;" >save</button><br>
    <a id="deleteExp"  style="position: absolute;left: 116%;top:7%;"  href="/profile/experience/delete/{{data._id}}" >delete</a>
    <a id="cancelEdit" style="left: 116%;position: absolute;top:4%;" href="/profile" >cancel</a>

</form>

</div>
