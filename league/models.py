from __future__ import unicode_literals
from django.db import models as m
from django.contrib.auth.models import User
from django.utils import timezone
import team
from django.db.models import Q
import sys


class Vendor(m.Model):
    name    = m.CharField(max_length=40, blank=False, unique=True)
    website = m.CharField(max_length=250, blank=False)

    def __str__(self):
        return "%s - %s" % ( self.name, self.website)



FLEX = [ 'RB', 'WR', 'TE' ]
TEAM_DEFENSE = ['D', 'ST']
DRAFT_TYPE_CHOICES = (
    ('S', 'Snake'),
    ('L', 'Linear')
)
LEAGUE_TYPE_CHOICES = (
    ('STD', 'Standard'),
    ('PPR', 'PPR')
)

class League_Settings(m.Model):
    number_of_teams = m.IntegerField(blank=True,  null=True, default=12)
    scoring_type   = m.CharField(max_length=30, default="Head to Head Points")
    league_type = m.CharField(max_length=3, choices=DRAFT_TYPE_CHOICES, default = 'STD')

    # Roster Settings
    size     = m.IntegerField(default=12)
    starters = m.IntegerField(default=16)
    benched  = m.IntegerField(default=9)

    count_QB_min=m.IntegerField(default=1)
    count_QB_max=m.IntegerField(default=4)

    count_RB_min=m.IntegerField(default=2)
    count_RB_max=m.IntegerField(default=8)

    count_WR_min=m.IntegerField(default=2)
    count_WR_max=m .IntegerField(default=8)

    count_TE_min=m.IntegerField(default=1)
    count_TE_max=m.IntegerField(default=3)

    count_FLEX_min=m.IntegerField(default=1)
    count_FLEX_max=m.IntegerField(default=1)

    count_K_min = m.IntegerField(default=1)
    count_K_max = m.IntegerField(default=3)
    
    
    # Scoring Settings

    # Passing
    PTD = m.IntegerField("TD Pass", default = 4)
    P2PC = m.IntegerField("2pt Passing Conversion", default = 2)

    # Rushing
    RTD = m.IntegerField("TD Rush", default=6)

    # Receiving
    REC = m.IntegerField("Each reception", default=1)
    P2REC = m.IntegerField("2pt Receiving Conversion", default=2)

    # Miscellaneous
    PRTD = m.IntegerField("Punt Return TD", default=6)
    FUML = m.IntegerField("Total Fumbles Lost", default=-2)
    FRTD = m.IntegerField("Fumble Return TD", default=6)

    # Kicking
    FGM = m.IntegerField("Total FG Missed", default=-1)
    FG40= m.IntegerField("FG Made (40-49 yards)", default=4)

    # Team Defense / Special Teams
    INTTD = m.IntegerField("Interception Return TD", default=6)
    KRTD = m.IntegerField("Kickoff Return TD", default=6)
    BLKKRTD = m.IntegerField("Blocked Punt or FG return for TD", default=6)
    INT = m.IntegerField("Each Interception", default=2)
    SF = m.IntegerField("Each Safety", default=2)
    PA1 = m.IntegerField("1-6 points allowed", default=4)
    PA14 = m.IntegerField("14-17 points allowed", default=1)
    PA35 = m.IntegerField("35-45 points allowed", default=-3)
    YA100 = m.IntegerField("Less than 100 total yards allowed", default=5)
    YA299 = m.IntegerField("200-299 total yards allowed", default=2)
    YA449 = m.IntegerField("400-449 total yards allowed", default=-3)
    YA549 = m.IntegerField("500-549 total yards allowed", default=-6)


    #PLAYER RULES
    # (?)Observe ESPNs Undroppable Players List -- Yes
    player_universe = m.CharField(max_length=20, verbose_name="Player Universe", default="All NFL Players")

    # ACQUISITION AND WAIVER RULES
    lineup_changes = m.CharField("Lineup Changes", max_length=50, default="Lock Individually at Scheduled Gametime")
    player_acquisition_system = m.CharField("Player Acquisition System", max_length=20, default="Waivers")
    season_acquisition_limit  = m.CharField("Season Acquisition Limit",  max_length=20, default="No Limit")
    waiver_period = m.CharField(max_length=20, verbose_name="Waiver Period", default="1 Day")
    waiver_order  = m.CharField(max_length=40, verbose_name="Waiver Order", default="Move to last after claim")

    #TRADE RULES
    trade_limit = m.CharField(max_length=20, verbose_name= "Trade Limit", default="No Limit")
    trade_deadline = m.DateTimeField("Trade Deadline", default=timezone.now, blank=True)
    trade_review_period = m.CharField(max_length=20, verbose_name= "Trade Review Period", default="2 Days")
    votes_required_to_veto_trade = m.IntegerField("Votes Required to Veto Trade", default=4)

    # KEEPERS RULES (Edit)
    use_keepers_for_2013_season = m.BooleanField(default=False)
    use_keepers_for_2014_season = m.BooleanField(default=False)

    # REGULAR SEASON SETUP (Edit)
    start_of_regular_season = m.IntegerField(default = 1) # Week 1
    weeks_per_matchup = m.IntegerField(default=1) # every week matchup
    regular_season_matchups = m.IntegerField(default=13) # (Playoffs start Week 14)
    matchup_tie_breaker = m.CharField(max_length=20, default="None")
    home_field_advantage = m.CharField(max_length=20,default="None")

    # PLAYOFF BRACKET SETUP (Edit)
    playoff_teams = m.IntegerField(default=6)
    playoff_rounds= m.IntegerField(default=3)
    plaoff_byes   = m.IntegerField(default=2)
    weeks_per_playoff_matchup = m.CharField(max_length=20,  default="1 week per round")
    playoff_seeding_tie_breaker = m.CharField(max_length=20,default="Total Points For")
    playoff_home_field_advantage = m.BooleanField(default=False)

    # DRAFT SETTINGS (Edit)
    draft_type = m.CharField(max_length=1, choices=DRAFT_TYPE_CHOICES, default = 'S')
    draft_date = m.DateTimeField("Draft Date", default=timezone.now)
    seconds_per_pick = m.IntegerField(default=120)
    draft_order = m.CharField(max_length=50, default="Randomized 1 Hour Prior to DraftTime")
    is_draft_done = m.IntegerField(default=0)

    def __str__(self):
        self.save()
        return "League - %d" % (self.id)

class League(m.Model):
    name   = m.CharField(max_length=100, blank=False)
    vendor = m.ForeignKey(Vendor)
    league_id = m.CharField(max_length=50, blank=True)
    league_owner    = m.ForeignKey(User)
    password = m.CharField(max_length=15, default='', blank=True)
    draft_current = m.ForeignKey('team.Team', related_name="draft_league",
                                 null=True, blank=True)
    draft_timeout = m.DateTimeField("Timelimit for current drafter.", null=True)
    settings = m.ForeignKey(League_Settings)


    def finish_draft(self):
        self.draft_current = None
        self.draft_timeout = timezone.now()
        self.settings.is_draft_done = 2      # draft done
        self.settings.save()
        self.save()        

    def timeout(self):
        if self.draft_timeout<=timezone.now():
            self.draft_current.auto_draft_player(force=True)
            self.update_the_next_drafter_info(draft_current)

    def update_the_next_drafter_info(self, team=None):
        print __name__, sys._getframe().f_code.co_name
        league_teams = self.team_set.all().order_by('draft_pick_number')
        i=0
        if team:
            if team != self.draft_current or league_teams.filter(team=team):
                return False
            i = (league_teams.index(team)+1)%len(league_teams)
        print league_teams[i]
        while league_teams[i].auto_draft_player():
            print "-->Autodrafting for <", i, league_teams[i], ">"
            i = (i+1) % len(league_teams)
        print "None to Autodraft!"
        if league_teams[i].is_full(): # End the drafting
            self.finish_draft()
            return False
        self.draft_current = league_teams[i]
        self.draft_timeout = timezone.now() + timezone.timedelta(seconds=self.settings.seconds_per_pick);
        print "next_timeout:", self.draft_timeout
        self.save()
        return True;


    def remove_player_from_otherslist(self, player):
        for p in team.models.FantasyPlayer.objects.filter(Q(team__league__league_id=self.league_id) & \
                                              Q(player=player) & Q(status='Q')):
                p.delete()



    def start_draft(self):
        if self.settings.is_draft_done==1:
            if not self.draft_current:
                return self.update_the_next_drafter_info()
            return True
        if self.settings.is_draft_done==2:
            return False;
        print __name__, sys._getframe().f_code.co_name
        tnow = timezone.now()
        draft_starttime = self.settings.draft_date
        total_draft_time = timezone.timedelta(seconds=((self.settings.number_of_teams+1)*self.settings.seconds_per_pick))
        draft_endtime  = draft_starttime+total_draft_time
        print tnow, draft_starttime, draft_endtime
        if (tnow > draft_starttime) and (tnow < draft_endtime) and (self.settings.is_draft_done == 0):
            self.settings.is_draft_done = 1          # started
            self.settings.save();
            print "------- Satrting the draft!! --------"
            return self.update_the_next_drafter_info()
        print tnow, draft_starttime, draft_endtime
        return False


    def get_transactions_since(self, after_trid=0, after_time=0):
        tns = team.models.Transaction.objects.filter(Q(team__league=self) & Q(id__gt=after_trid)).only('player1__player__pid', 'id')
        pids, last_trid = [], -1
        if tns:
            pids = [t[0] for t in tns.values_list('player1__player__pid')]
            last_trid = tns.all().reverse()[0].id
        # TODO - sends only add player transactinos
        return pids, last_trid


    def __str__(self):
        #return str(self.__dict__)
        return "%s - %s (%s)" % ( self.name, self.vendor, self.league_id)

