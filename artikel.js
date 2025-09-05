function getArtikelHTML(a){
    var anr = a.artikelnr;
    if(a.hasOwnProperty('artikelnrtvg') && a != null && a.artikelnrtvg != ""){anr += "/" + a.artikelnrtvg;}
    anr = '<span class="badge artikelnr py-1 px-2 me-1">' + anr + '</span>';

    let rphs = a.rechtsPersonen.map(x => verwerkRechtspersoon(x));
    let rph = rphs.join(' en ');
    return anr + ': ' + rph
}

function verwerkRechtspersoon(rp){
    let r;
    if(rp.type == "PERSOON"){
        let p = new Persoon(rp.persoon);
        r = p.lbl();
    } else if (rp.type == "VERWIJZING") {
        let pv = new Verwijzing(rp.persoonsVerwijzing);
        r = pv.lbl();
    } else if (rp.type == "INSTANTIE"){
        let instantie = new Instantie(rp.instantie);
        r = instantie.lbl();
    } else {
        console.error("onherkend type: " + rp.type);
    }
    if(rp.rol != "EIGENAAR"){
        r += '<span class="badge rol p-1">' + rp.rol + '</span>' 
    }
    return r
}

class Artikel {
    nr;
    tvg;
    cs;
    reeks;
    rechtsPersonen;

    constructor(json){
        this.nr = json.artikelnr;
        this.tvg = json.artikelnrtvg || '';
        this.cs = json.consorten;
        this.reeks = json.reeks;
        this.rechtsPersonen = []
    }

    lbl(){return this.nr + (this.tvg ? '/'+this.tvg : '')}
}

class RechtsPersoon {
    rpi;
    rol;
    type;

    constructor(json){
        this.rol = json.rol;
        this.type = json.type;
    }
}

class RPI {
    // abstract
    lbl(){}
}

class Verwijzing extends RPI {
    inRelatieTot;
    persoon;
    verwijzing;

    constructor(json){
        super();
        this.inRelatieTot = (json.hasOwnProperty("inRelatieTot") ? new Persoon(json.inRelatieTot) : null);
        this.persoon = (json.hasOwnProperty("persoon") ? new Persoon(json.persoon) : null);
        this.verwijzing = (json.verwijzing in d_verw ? d_verw[json.verwijzing] : json_verwijzing);
    }

    lbl(){
        let l = "";
        l += this.inRelatieTot ? this.inRelatieTot.lbl() : '';
        // l.length > 0 ? ' ' : '';
        l += "<span class='verwijzing badge rounded-pill mx-2 p-1'>" + this.verwijzing + "</span>";
        l += this.persoon ? this.persoon.lbl() : '';
        return l
    }
}


d_jrSr = [];
d_jrSr['JR'] = 'Junior';
d_jrSr['SR'] = 'Senior';

class Persoon extends RPI {
    achternaam;
    voornaam;
    voorvoegsel;
    titel;
    beroep;
    woonplaats;
    varianten; //@TODO nog verwerken

    constructor(json){
        super();
        this.achternaam = json.achternaam || '';
        this.voornaam = json.voornaam || '';
        this.voorvoegsel = json.voorvoegsel || '';
        this.titel = json.titel || '';
        this.jrSr = json.jrSr || '';
        this.beroep = json.beroep || '';
        this.woonplaats = json.woonplaats || '';
        this.varianten = [];
    }

    lbl(){
        let l = this.titel || '';
        l += ((this.voornaam.length > 0 && l.length > 0) ? ' ' : '' ) + this.voornaam;
        l += ((this.voorvoegsel.length > 0 && l.length > 0) ? ' ' : '' ) + this.voorvoegsel;
        l += ((this.achternaam.length > 0 && l.length > 0) ? ' ' : '' ) + this.achternaam;
        l += (this.jrSr.length > 0 ? '<span class="badge jrSr p-1 mx-1">' + d_jrSr[this.jrSr] + '</span>' : '');
        if(this.beroep.length > 0 && this.woonplaats.length > 0){l += ' (<span class="badge beroep p-1">' + this.beroep + '</span> te <span class="badge plaats p-1">' + this.woonplaats + '</span>)';}
        else if (this.beroep.length > 0){l += ' (<span class="badge beroep p-1">' + this.beroep + '</span>)';}
        else if (this.woonplaats.length > 0){l += ' (<span class="badge plaats p-1">' + this.woonplaats + '</span>)';}
        return l
    }
}

class Instantie extends RPI {
    naam;
    plaats;
    type;
    gezindte;

    constructor(json){
        super();
        this.naam = json.naam || '';
        this.plaats = json.plaats || '';
        this.type = json.type || '';
        this.gezindte = json.gezindte || '';
    }

    lbl(){
        let l = this.gezindte || '';
        l += (l.length > 0 && this.type.length > 0) ? ' ' : '';
        l += this.type || '';
        l += (l.length > 0 && this.naam.length > 0) ? ' ' : '';
        l += this.naam || '';
        l += (l.length > 0 && this.plaats.length > 0) ? ' te ' : '';
        l += '<span class="badge plaats p-1">' + this.plaats + '</span>' || '';
        return l
    }
}

d_verw = [];
d_verw['WEDUWE_VAN'] = 'weduwe van';
d_verw['ERVEN_VAN'] = 'erven van';
d_verw['ECHTGENOOT_VAN'] = 'echtgeno(o)t(e) van';
d_verw['GESCHEIDEN_VAN'] = 'gescheiden van';
d_verw['HUISVROUW_VAN'] = 'huisvrouw van';
d_verw['VOOGD_VAN'] = 'voogd van';
d_verw['IN_HUWELIJK_HEBBENDE'] = 'in huwelijk hebbende';
d_verw['KINDEREN_VAN'] = 'kinderen van';
d_verw['ERVEN_VAN_WEDUWE'] = 'erven en weduwe van';
d_verw['BOEDEL_VAN'] = 'boedel van';
