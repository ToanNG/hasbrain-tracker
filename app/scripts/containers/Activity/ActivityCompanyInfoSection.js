import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import Colors from 'material-ui/lib/styles/colors';
import Card from 'material-ui/lib/card/card';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';
import CardTitle from 'material-ui/lib/card/card-title';
import Divider from 'material-ui/lib/divider';
import Avatar from 'material-ui/lib/avatar';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';

@connect(mapStateToProps, null)
class ActivityCompanyInfoSection extends Component {
    render = () => {
        const {activity, pairing, user} = this.props;
        const todayActivity = activity.get('todayActivity');
        const partner = pairing.get('pairing');
        const currentUser = user.get('currentUser');

        const {company} = todayActivity;
        const buddy = (partner) ? ((currentUser._id === partner.studentA._id) ? partner.studentB : partner.studentA) : null;

        return (
            <div className='company'>
                {
                    company &&
                    <Card>
                        <CardTitle style={{width: 592}}
                            title={company.name || ''}
                            subtitle={company.email || ''}/>
                        <CardText>
                            <div dangerouslySetInnerHTML={{__html: company.description}}/>
                            <br/>
                            <Divider/>
                            <br/>
                            {company.contact ? 'Contact: ' + company.contact : ''}
                        </CardText>
                    </Card>
                }
                {
                    buddy &&
                    <Card>
                        <CardHeader title="Your buddy" subtitle="Will help you come over this challenge"/>
                        <CardText>
                            <List>
                                <ListItem
                                    primaryText={`${buddy.name.first} ${buddy.name.last}`}
                                    leftAvatar={<Avatar src="https://avatars3.githubusercontent.com/u/12455778?v=3&s=460"/>} />
                            </List>
                        </CardText>
                    </Card>
                }
            </div>
        )
    }
};

function mapStateToProps(state) {
    return {
        activity: state.activity,
        user: state.user,
        pairing: state.pairing
    };
}

export default ActivityCompanyInfoSection;
