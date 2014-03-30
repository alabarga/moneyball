import json

from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.template import Context, loader
from django.shortcuts import render, render_to_response
from django.core import serializers
from league.models import League

def updates(request, league_id):
    r = {'league_id': league_id}
    try:
        l = League.objects.get(league_id = league_id)
        r.update({ 'current': l.draft_current_id, 'timeout':
            str(l.draft_timeout) })
    except League.DoesNotExist:
        pass
    return HttpResponse(json.dumps(r),
            content_type="application/json")
